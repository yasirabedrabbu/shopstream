package com.shopstream.coreapi.payment;

import java.time.Instant;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import com.shopstream.coreapi.catalog.ProductRepository;
import com.shopstream.coreapi.common.ApiException;
import com.shopstream.coreapi.inventory.InventoryClient;
import com.shopstream.coreapi.order.Order;
import com.shopstream.coreapi.order.OrderItem;
import com.shopstream.coreapi.order.OrderRepository;
import com.shopstream.coreapi.order.OrderStatus;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    /** What the frontend receives after starting a payment. */
    public record Session(UUID paymentId, PaymentProvider provider, String providerReference, String clientSecret) {
    }

    private record Draft(UUID paymentId, long amountCents, String currency) {
    }

    private final Map<PaymentProvider, PaymentGateway> gateways = new EnumMap<>(PaymentProvider.class);
    private final PaymentRepository payments;
    private final OrderRepository orders;
    private final ProductRepository products;
    private final InventoryClient inventory;
    private final JdbcTemplate jdbc;
    private final TransactionTemplate tx;

    public PaymentService(List<PaymentGateway> gatewayList, PaymentRepository payments, OrderRepository orders,
            ProductRepository products, InventoryClient inventory, JdbcTemplate jdbc, TransactionTemplate tx) {
        gatewayList.forEach(g -> gateways.put(g.provider(), g));
        this.payments = payments;
        this.orders = orders;
        this.products = products;
        this.inventory = inventory;
        this.jdbc = jdbc;
        this.tx = tx;
    }

    public PaymentGateway gateway(PaymentProvider provider) {
        PaymentGateway gateway = gateways.get(provider);
        if (gateway == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Payment provider not available: " + provider);
        }
        return gateway;
    }

    /** Start a payment for the customer's own AWAITING_PAYMENT order. */
    public Session start(UUID customerId, UUID orderId, PaymentProvider provider) {
        PaymentGateway gateway = gateway(provider);

        // Step 1 (DB): check the order and create a PENDING payment row.
        Draft draft = Objects.requireNonNull(tx.execute(s -> {
            Order order = orders.findByIdAndCustomerId(orderId, customerId)
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
            if (order.getStatus() != OrderStatus.AWAITING_PAYMENT) {
                throw new ApiException(HttpStatus.CONFLICT, "Order is not awaiting payment");
            }
            Instant expiresAt = order.getReservationExpiresAt();
            if (expiresAt != null && expiresAt.isBefore(Instant.now())) {
                throw new ApiException(HttpStatus.CONFLICT, "Your stock reservation has expired");
            }
            Payment payment = payments.save(
                    new Payment(order.getId(), provider, order.getTotalCents(), order.getCurrency()));
            return new Draft(payment.getId(), payment.getAmountCents(), payment.getCurrency());
        }));

        // Step 2 (remote): ask the provider. Never inside a DB transaction.
        PaymentGateway.CreatedPayment created;
        try {
            created = gateway.create(orderId, draft.paymentId(), draft.amountCents(), draft.currency());
        } catch (RuntimeException ex) {
            log.error("Gateway {} failed to create payment {}", provider, draft.paymentId(), ex);
            tx.executeWithoutResult(s -> payments.findById(draft.paymentId()).ifPresent(Payment::markFailed));
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Payment provider is unavailable. Please try again.");
        }
        final PaymentGateway.CreatedPayment result = created;

        // Step 3 (DB): remember the provider's reference so webhooks can find this payment.
        tx.executeWithoutResult(s -> payments.findById(draft.paymentId())
                .orElseThrow()
                .attachReference(result.providerReference()));

        return new Session(draft.paymentId(), provider, result.providerReference(), result.clientSecret());
    }

    /**
     * Called by webhooks (or the mock confirm endpoint). Safe to call many times with the same event.
     * The event de-dup row, the payment update, the order update and the stock change
     * commit together or not at all.
     */
    public void handleEvent(PaymentProvider provider, PaymentGateway.PaymentEvent event) {
        UUID paidOrderId = tx.execute(s -> {
            int inserted = jdbc.update(
                    "INSERT INTO payment_events (provider, event_id) VALUES (?, ?) ON CONFLICT DO NOTHING",
                    provider.name(), event.eventId());
            if (inserted == 0) {
                log.info("Duplicate {} event {} ignored", provider, event.eventId());
                return null;
            }

            Payment payment = payments
                    .findByProviderAndProviderReference(provider, event.providerReference())
                    .orElse(null);
            if (payment == null) {
                log.warn("{} event {} refers to unknown payment {}", provider, event.eventId(),
                        event.providerReference());
                return null;
            }

            if (event.outcome() == PaymentGateway.PaymentEvent.Outcome.FAILED) {
                if (payment.getStatus() == PaymentStatus.PENDING) {
                    payment.markFailed();
                }
                return null;
            }

            payment.markSucceeded();
            Order order = orders.findWithLockById(payment.getOrderId()).orElseThrow();

            if (order.getStatus() == OrderStatus.AWAITING_PAYMENT) {
                order.markPaid();
                deductStock(order);
                return order.getId();
            }
            if (order.getStatus() != OrderStatus.PAID) {
                log.error("Payment {} succeeded but order {} is {}. MANUAL REFUND NEEDED.",
                        payment.getId(), order.getId(), order.getStatus());
            }
            return null;
        });

        // After commit: tell the inventory engine the hold is now a real sale.
        if (paidOrderId != null) {
            try {
                inventory.finalizeReservation(paidOrderId);
            } catch (RuntimeException ex) {
                log.error("Order {} is PAID but finalizeReservation failed. Needs retry.", paidOrderId, ex);
            }
        }
    }

    /** Runs inside the same transaction as markPaid, so PAID and the stock change commit together. */
    private void deductStock(Order order) {
        for (OrderItem item : order.getItems()) {
            int updated = products.decrementStock(item.getProductId(), item.getQuantity());
            if (updated == 0) {
                log.error("OVERSOLD: product {} has fewer than {} units in Postgres (order {}). Needs manual action.",
                        item.getProductId(), item.getQuantity(), order.getId());
            }
        }
    }
}