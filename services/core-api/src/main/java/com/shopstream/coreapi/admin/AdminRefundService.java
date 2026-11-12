package com.shopstream.coreapi.admin;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import com.shopstream.coreapi.catalog.ProductRepository;
import com.shopstream.coreapi.common.ApiException;
import com.shopstream.coreapi.order.FulfillmentStatus;
import com.shopstream.coreapi.order.Order;
import com.shopstream.coreapi.order.OrderItem;
import com.shopstream.coreapi.order.OrderRepository;
import com.shopstream.coreapi.order.OrderStatus;
import com.shopstream.coreapi.payment.Payment;
import com.shopstream.coreapi.payment.PaymentGateway;
import com.shopstream.coreapi.payment.PaymentRepository;
import com.shopstream.coreapi.payment.PaymentReviewReason;
import com.shopstream.coreapi.payment.PaymentService;
import com.shopstream.coreapi.payment.PaymentStatus;

@Service
public class AdminRefundService {

    private final PaymentRepository payments;
    private final OrderRepository orders;
    private final ProductRepository products;
    private final PaymentService paymentService;
    private final TransactionTemplate tx;

    public AdminRefundService(PaymentRepository payments, OrderRepository orders,
            ProductRepository products, PaymentService paymentService, TransactionTemplate tx) {
        this.payments = payments;
        this.orders = orders;
        this.products = products;
        this.paymentService = paymentService;
        this.tx = tx;
    }

    /**
     * Admin refund.
     *
     * Rules:
     * - Already refunded: 409.
     * - PENDING payment under review (HELD): no money moved, so the review is only closed.
     * - Only a SUCCEEDED payment goes to the gateway.
     * - AMOUNT_MISMATCH: 409. We do not store what the customer really paid, so a refund by API
     *   could be the wrong amount. Refund it in the provider panel, then call /resolve.
     * - DUPLICATE_CHARGE and LATE_PAYMENT: the order is never touched. The order belongs to
     *   another payment (or is already closed).
     * - Any other SUCCEEDED payment on a PAID order: with cancelOrder=true the order is cancelled
     *   and its stock goes back. If any item already shipped, cancelOrder=true is refused.
     *
     * The order row is locked first (same lock order as PaymentService.handleEvent), so two refund
     * clicks, or a refund and a webhook, run one after the other. The gateway call happens inside
     * that transaction on purpose: if it throws, nothing is committed.
     */
    public AdminPaymentReviewResponse refund(UUID paymentId, boolean cancelOrder) {
        UUID orderId = payments.findOrderIdById(paymentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Payment not found"));

        return Objects.requireNonNull(tx.execute(status -> refundInTx(paymentId, orderId, cancelOrder)));
    }

    private AdminPaymentReviewResponse refundInTx(UUID paymentId, UUID orderId, boolean cancelOrder) {
        Order order = orders.findWithLockById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
        Payment payment = payments.findById(paymentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Payment not found"));

        if (payment.getRefundedAt() != null) {
            throw new ApiException(HttpStatus.CONFLICT, "Payment is already refunded");
        }

        // HELD path: money never moved, so there is nothing to give back. Only close the review.
        if (payment.getStatus() == PaymentStatus.PENDING) {
            if (payment.getReviewReason() == null) {
                throw new ApiException(HttpStatus.CONFLICT,
                        "Payment is PENDING but not under review. Cannot refund.");
            }
            if (payment.getReviewResolvedAt() != null) {
                throw new ApiException(HttpStatus.CONFLICT, "This review is already resolved");
            }
            payment.resolveReview();
            return AdminPaymentReviewResponse.from(payment);
        }

        if (payment.getStatus() != PaymentStatus.SUCCEEDED) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Only a SUCCEEDED payment can be refunded (current status: " + payment.getStatus() + ")");
        }

        PaymentReviewReason reason = payment.getReviewReason();
        if (reason == PaymentReviewReason.AMOUNT_MISMATCH) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Amount mismatch: refund this payment in the provider panel, then call resolve");
        }

        boolean ownsOrder = reason != PaymentReviewReason.DUPLICATE_CHARGE
                && reason != PaymentReviewReason.LATE_PAYMENT;
        boolean cancelNow = cancelOrder && ownsOrder && order.getStatus() == OrderStatus.PAID;

        if (cancelNow) {
            for (OrderItem item : order.getItems()) {
                FulfillmentStatus fs = item.getFulfillmentStatus();
                if (fs == FulfillmentStatus.SHIPPED || fs == FulfillmentStatus.DELIVERED) {
                    throw new ApiException(HttpStatus.CONFLICT,
                            "Some items already shipped. Refund with cancelOrder=false instead");
                }
            }
        }

        PaymentGateway gateway = paymentService.gateway(payment.getProvider());
        PaymentGateway.RefundResult result = gateway.refund(
                payment.getProviderReference(),
                payment.getAmountCents(),
                payment.getCurrency(),
                payment.getBankTranId(),
                payment.getValId());

        payment.markRefunded(result.refundReference()); // also closes any open review

        if (cancelNow) {
            // Collect first: cancelAfterRefund marks every item CANCELLED.
            List<OrderItem> toReturn = order.getItems().stream()
                    .filter(i -> i.getFulfillmentStatus() != FulfillmentStatus.CANCELLED)
                    .toList();
            for (OrderItem item : toReturn) {
                products.incrementStock(item.getProductId(), item.getQuantity());
            }
            order.cancelAfterRefund("Refunded by admin");
        }

        return AdminPaymentReviewResponse.from(payment);
    }
}