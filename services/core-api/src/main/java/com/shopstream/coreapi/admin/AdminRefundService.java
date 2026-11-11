package com.shopstream.coreapi.admin;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopstream.coreapi.catalog.ProductRepository;
import com.shopstream.coreapi.common.ApiException;
import com.shopstream.coreapi.order.Order;
import com.shopstream.coreapi.order.OrderItem;
import com.shopstream.coreapi.order.OrderRepository;
import com.shopstream.coreapi.order.OrderStatus;
import com.shopstream.coreapi.payment.Payment;
import com.shopstream.coreapi.payment.PaymentGateway;
import com.shopstream.coreapi.payment.PaymentRepository;
import com.shopstream.coreapi.payment.PaymentService;
import com.shopstream.coreapi.payment.PaymentStatus;

@Service
public class AdminRefundService {

    private final PaymentRepository payments;
    private final OrderRepository orders;
    private final ProductRepository products;
    private final PaymentService paymentService;

    public AdminRefundService(PaymentRepository payments, OrderRepository orders,
            ProductRepository products, PaymentService paymentService) {
        this.payments = payments;
        this.orders = orders;
        this.products = products;
        this.paymentService = paymentService;
    }

    /**
     * Full refund flow:
     * 1. Validate the payment is SUCCEEDED and not yet refunded.
     * 2. Call the gateway (remote, outside the transaction).
     * 3. Mark payment refunded, cancel the order if still AWAITING_PAYMENT or PAID, return stock.
     *
     * HELD payments: status is PENDING, not SUCCEEDED. Payment.markRefunded requires SUCCEEDED.
     * Decision: for HELD, we skip the gateway call (no money was taken) and just resolve the review.
     * The order stays as-is (still AWAITING_PAYMENT, customer can retry or we cancel manually).
     */
    @Transactional
    public AdminPaymentReviewResponse refund(UUID paymentId, boolean cancelOrder) {
        Payment payment = payments.findById(paymentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Payment not found"));

        if (payment.getRefundedAt() != null) {
            throw new ApiException(HttpStatus.CONFLICT, "Payment is already refunded");
        }

        // HELD path: money never moved, just close the review.
        if (payment.getStatus() == PaymentStatus.PENDING) {
            if (payment.getReviewReason() == null) {
                throw new ApiException(HttpStatus.CONFLICT,
                        "Payment is PENDING but not under review. Cannot refund.");
            }
            payment.resolveReview();
            return AdminPaymentReviewResponse.from(payment);
        }

        if (payment.getStatus() != PaymentStatus.SUCCEEDED) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Only a SUCCEEDED payment can be refunded (current status: " + payment.getStatus() + ")");
        }

        // Remote call outside the transaction would be ideal, but we need the payment data.
        // We do it here: if the gateway throws, nothing is committed.
        PaymentGateway gateway = paymentService.gateway(payment.getProvider());
        PaymentGateway.RefundResult result = gateway.refund(
                payment.getProviderReference(),
                payment.getAmountCents(),
                payment.getCurrency(),
                payment.getBankTranId(),
                payment.getValId());

        payment.markRefunded(result.refundReference()); // also closes the review

        if (cancelOrder) {
            orders.findById(payment.getOrderId()).ifPresent(order -> {
                if (order.getStatus() == OrderStatus.AWAITING_PAYMENT
                        || order.getStatus() == OrderStatus.PAID) {
                    order.cancel("Refunded by admin");
                    returnStock(order);
                }
            });
        }

        return AdminPaymentReviewResponse.from(payment);
    }

    /** Return stock for every non-cancelled item in the order. */
    private void returnStock(Order order) {
        for (OrderItem item : order.getItems()) {
            if (item.getFulfillmentStatus() != com.shopstream.coreapi.order.FulfillmentStatus.CANCELLED) {
                products.findById(item.getProductId()).ifPresent(product ->
                        product.update(
                                product.getCategory(),
                                product.getName(),
                                product.getDescription(),
                                product.getPriceCents(),
                                product.getCurrency(),
                                product.getStockQuantity() + item.getQuantity(),
                                product.getImageUrls()));
            }
        }
    }
}