package com.shopstream.coreapi.payment;

import java.time.Instant;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

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
import com.shopstream.coreapi.order.ShippingAddress;
import com.shopstream.coreapi.user.User;
import com.shopstream.coreapi.user.UserRepository;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    /** What the frontend receives after starting a payment. */
    public record Session(UUID paymentId, PaymentProvider provider, String providerReference,
            String clientSecret, String redirectUrl) {
    }

    private final Map<PaymentProvider, PaymentGateway> gateways = new EnumMap<>(PaymentProvider.class);
    private final PaymentRepository payments;
    private final OrderRepository orders;
    private final UserRepository users;
    private final ProductRepository products;
    private final InventoryClient inventory;
    private final JdbcTemplate jdbc;
    private final TransactionTemplate tx;

    public PaymentService(List<PaymentGateway> gatewayList, PaymentRepository payments, OrderRepository orders,
            UserRepository users, ProductRepository products, InventoryClient inventory, JdbcTemplate jdbc,
            TransactionTemplate tx) {
        gatewayList.forEach(g -> gateways.put(g.provider(), g));
        this.payments = payments;
        this.orders = orders;
        this.users = users;
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
        PaymentGateway.CheckoutContext context = Objects.requireNonNull(tx.execute(s -> {
            // Ownership check first, so a stranger cannot even lock someone else's order.
            orders.findByIdAndCustomerId(orderId, customerId)
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));

            // Lock the order row. Two quick "Pay" clicks now run one after the other,
            // so they cannot both create a payment.
            Order order = orders.findWithLockById(orderId).orElseThrow();

            if (order.getStatus() != OrderStatus.AWAITING_PAYMENT) {
                throw new ApiException(HttpStatus.CONFLICT, "Order is not awaiting payment");
            }
            Instant expiresAt = order.getReservationExpiresAt();
            if (expiresAt != null && expiresAt.isBefore(Instant.now())) {
                throw new ApiException(HttpStatus.CONFLICT, "Your stock reservation has expired");
            }
            ShippingAddress address = order.getShippingAddress();
            if (address == null) {
                throw new ApiException(HttpStatus.CONFLICT, "This order has no shipping address");
            }

            // Only one live payment per order. Older unfinished attempts are retired.
            for (Payment old : payments.findByOrderIdAndStatus(order.getId(), PaymentStatus.PENDING)) {
                old.markFailed();
            }

            Payment payment = payments.save(
                    new Payment(order.getId(), provider, order.getTotalCents(), order.getCurrency()));

            User customer = users.findById(customerId)
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
            int itemCount = order.getItems().stream().mapToInt(OrderItem::getQuantity).sum();
            String joinedNames = order.getItems().stream()
                    .map(OrderItem::getProductName)
                    .collect(Collectors.joining(","));
            String productSummary = joinedNames.length() > 250 ? joinedNames.substring(0, 250) : joinedNames;

            return new PaymentGateway.CheckoutContext(
                    order.getId(),
                    payment.getId(),
                    payment.getAmountCents(),
                    payment.getCurrency(),
                    address.fullName(),
                    customer.getEmail(),
                    address.phone(),
                    address.line1(),
                    address.city(),
                    address.state(),
                    address.postalCode(),
                    address.country(),
                    itemCount,
                    productSummary);
        }));

        // Step 2 (remote): ask the provider. Never inside a DB transaction.
        PaymentGateway.CreatedPayment created;
        try {
            created = gateway.create(context);
        } catch (RuntimeException ex) {
            log.error("Gateway {} failed to create payment {}", provider, context.paymentId(), ex);
            tx.executeWithoutResult(s -> payments.findById(context.paymentId()).ifPresent(Payment::markFailed));
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Payment provider is unavailable. Please try again.");
        }
        final PaymentGateway.CreatedPayment result = created;

        // Step 3 (DB): remember the provider's reference so webhooks can find this payment.
        tx.executeWithoutResult(s -> payments.findById(context.paymentId())
                .orElseThrow()
                .attachReference(result.providerReference()));

        return new Session(context.paymentId(), provider, result.providerReference(),
                result.clientSecret(), result.redirectUrl());
    }

    /**
     * Called by webhooks (or the mock confirm endpoint). Safe to call many times with the same event.
     * The event de-dup row, the payment update, the order update and the stock change
     * commit together or not at all.
     *
     * Anything a person must look at (held, wrong amount, double charge, late payment)
     * is written on the payment row, so the admin review list can find it.
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

            // Lock the order BEFORE changing the payment. start() uses the same order,
            // so a payment click and a webhook can never wait on each other forever.
            Order order = orders.findWithLockById(payment.getOrderId()).orElseThrow();

            if (event.outcome() == PaymentGateway.PaymentEvent.Outcome.HELD) {
                // The provider flagged this payment as risky. The order stays unpaid.
                payment.requestReview(PaymentReviewReason.HELD);
                log.error("RISKY PAYMENT HOLD: {} flagged payment {} (order {}) as risky. "
                        + "Order NOT marked paid. Added to the review list.",
                        provider, payment.getId(), order.getId());
                return null;
            }

            if (event.outcome() == PaymentGateway.PaymentEvent.Outcome.FAILED) {
                if (payment.getStatus() == PaymentStatus.PENDING) {
                    payment.markFailed();
                }
                return null;
            }

            // Real gateways report what the customer actually paid. It must match what we asked for.
            boolean amountWrong = event.amountCents() != null
                    && event.amountCents() != payment.getAmountCents();
            boolean currencyWrong = event.currency() != null
                    && !event.currency().equalsIgnoreCase(payment.getCurrency());
            if (amountWrong || currencyWrong) {
                // The provider did take money, so the payment counts as succeeded (a refund needs that).
                // The order is NOT marked paid, a person decides what to do.
                payment.markSucceeded();
                payment.attachBankDetails(event.bankTranId(), event.valId());
                payment.requestReview(PaymentReviewReason.AMOUNT_MISMATCH);
                log.error("AMOUNT MISMATCH: payment {} expected {} {} but {} reported {} {}. "
                        + "Order NOT marked paid. Added to the review list.",
                        payment.getId(), payment.getAmountCents(), payment.getCurrency(),
                        provider, event.amountCents(), event.currency());
                return null;
            }

            // Remember if this payment was already SUCCEEDED, so a repeat is not reported as a duplicate charge.
            boolean alreadySucceeded = payment.getStatus() == PaymentStatus.SUCCEEDED;
            payment.markSucceeded();
            payment.attachBankDetails(event.bankTranId(), event.valId());
            if (order.getStatus() == OrderStatus.AWAITING_PAYMENT) {
                order.markPaid();
                deductStock(order);
                return order.getId();
            }
            if (order.getStatus() == OrderStatus.PAID) {
                if (!alreadySucceeded) {
                    payment.requestReview(PaymentReviewReason.DUPLICATE_CHARGE);
                    log.error("DUPLICATE CHARGE: payment {} succeeded but order {} was already PAID by another "
                            + "payment. Added to the review list, refund needed.", payment.getId(), order.getId());
                }
                return null;
            }
            // Order is CANCELLED or EXPIRED, but the customer paid anyway.
            payment.requestReview(PaymentReviewReason.LATE_PAYMENT);
            log.error("LATE PAYMENT: payment {} succeeded but order {} is {}. "
                    + "Added to the review list, refund needed.",
                    payment.getId(), order.getId(), order.getStatus());
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