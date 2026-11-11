package com.shopstream.coreapi.order;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import com.shopstream.coreapi.catalog.Product;
import com.shopstream.coreapi.catalog.ProductRepository;
import com.shopstream.coreapi.catalog.ProductStatus;
import com.shopstream.coreapi.common.ApiException;
import com.shopstream.coreapi.common.PageResponse;
import com.shopstream.coreapi.inventory.InventoryClient;
import com.shopstream.coreapi.vendor.VendorStatus;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);
    private static final Duration HOLD = Duration.ofMinutes(10);
    private static final int MAX_QTY_PER_PRODUCT = 100;

    private final OrderRepository orders;
    private final ProductRepository products;
    private final InventoryClient inventory;
    private final TransactionTemplate tx;

    public OrderService(OrderRepository orders, ProductRepository products,
            InventoryClient inventory, TransactionTemplate tx) {
        this.orders = orders;
        this.products = products;
        this.inventory = inventory;
        this.tx = tx;
    }

    /**
     * No DB transaction is held while we talk to the inventory engine:
     * 1) save PENDING  2) reserve (remote)  3) flip to AWAITING_PAYMENT or CANCELLED.
     */
    public OrderResponse create(UUID customerId, CreateOrderRequest request) {
        Map<UUID, Integer> wanted = mergeLines(request);

        UUID orderId = Objects.requireNonNull(tx.execute(s -> savePending(customerId, wanted)));

        List<InventoryClient.Line> lines = wanted.entrySet().stream()
                .map(e -> new InventoryClient.Line(e.getKey(), e.getValue()))
                .toList();

        InventoryClient.ReservationResult result;
        try {
            result = inventory.reserve(orderId, lines, HOLD);
        } catch (RuntimeException ex) {
            log.error("Inventory reserve failed for order {}", orderId, ex);
            safeRelease(orderId);
            tx.executeWithoutResult(s -> cancelInTx(orderId, "Inventory service unavailable"));
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Could not reserve stock right now. Please try again.");
        }
        final InventoryClient.ReservationResult reservation = result;

        if (!reservation.success()) {
            tx.executeWithoutResult(s -> cancelInTx(orderId, "Sold out"));
            Map<String, String> details = new LinkedHashMap<>();
            reservation.unavailableProductIds().forEach(id -> details.put(id.toString(), "Sold out"));
            throw new ApiException(HttpStatus.CONFLICT, "Some items are sold out", details);
        }

        return Objects.requireNonNull(tx.execute(s -> {
            Order order = orders.findById(orderId).orElseThrow();
            order.markAwaitingPayment(reservation.expiresAt());
            return OrderResponse.from(order);
        }));
    }

    @Transactional(readOnly = true)
    public OrderResponse getMine(UUID customerId, UUID orderId) {
        return orders.findByIdAndCustomerId(orderId, customerId)
                .map(OrderResponse::from)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> listMine(UUID customerId, Pageable pageable) {
        Page<Order> page = orders.findByCustomerId(customerId, pageable);
        return PageResponse.of(page, OrderResponse::from);
    }

    public OrderResponse cancelMine(UUID customerId, UUID orderId) {
        OrderResponse response = Objects.requireNonNull(tx.execute(s -> {
            Order order = orders.findByIdAndCustomerId(orderId, customerId)
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
            if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.AWAITING_PAYMENT) {
                throw new ApiException(HttpStatus.CONFLICT,
                        "Order cannot be cancelled in status " + order.getStatus());
            }
            order.cancel("Cancelled by customer");
            return OrderResponse.from(order);
        }));
        safeRelease(orderId);
        return response;
    }

    // ---------- helpers ----------

    private UUID savePending(UUID customerId, Map<UUID, Integer> wanted) {
        List<Product> found = products.findAllById(wanted.keySet());
        if (found.size() != wanted.size()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "One or more products were not found");
        }

        String currency = found.get(0).getCurrency();
        Order order = new Order(customerId, currency);

        for (Product p : found) {
            if (p.getStatus() != ProductStatus.ACTIVE || p.getVendor().getStatus() != VendorStatus.APPROVED) {
                throw new ApiException(HttpStatus.CONFLICT, p.getName() + " is no longer available");
            }
            if (!p.getCurrency().equals(currency)) {
                throw new ApiException(HttpStatus.BAD_REQUEST,
                        "All items in one order must use the same currency");
            }
            order.addItem(new OrderItem(
                    p.getId(),
                    p.getVendor().getId(),
                    p.getName(),
                    p.getPriceCents(),
                    wanted.get(p.getId())));
        }
        return orders.save(order).getId();
    }

    private void cancelInTx(UUID orderId, String reason) {
        Order order = orders.findById(orderId).orElseThrow();
        if (order.getStatus() == OrderStatus.PENDING || order.getStatus() == OrderStatus.AWAITING_PAYMENT) {
            order.cancel(reason);
        }
    }

    private void safeRelease(UUID orderId) {
        try {
            inventory.release(orderId);
        } catch (RuntimeException ex) {
            log.warn("Release failed for order {}. The reservation will expire on its own.", orderId, ex);
        }
    }

    private static Map<UUID, Integer> mergeLines(CreateOrderRequest request) {
        Map<UUID, Integer> merged = new LinkedHashMap<>();
        for (CreateOrderRequest.Line line : request.items()) {
            merged.merge(line.productId(), line.quantity(), Integer::sum);
        }
        merged.forEach((id, qty) -> {
            if (qty > MAX_QTY_PER_PRODUCT) {
                throw new ApiException(HttpStatus.BAD_REQUEST,
                        "Maximum " + MAX_QTY_PER_PRODUCT + " units per product");
            }
        });
        return merged;
    }
}