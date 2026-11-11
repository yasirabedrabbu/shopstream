package com.shopstream.coreapi.admin;

import java.time.Instant;
import java.util.UUID;

import com.shopstream.coreapi.payment.Payment;
import com.shopstream.coreapi.payment.PaymentProvider;
import com.shopstream.coreapi.payment.PaymentReviewReason;
import com.shopstream.coreapi.payment.PaymentStatus;

/** One row of the admin "needs review" list. */
public record AdminPaymentReviewResponse(
        UUID paymentId,
        UUID orderId,
        PaymentProvider provider,
        String providerReference,
        PaymentStatus status,
        long amountCents,
        String currency,
        String bankTranId,
        PaymentReviewReason reviewReason,
        Instant reviewAt,
        Instant refundedAt,
        Instant createdAt) {

    public static AdminPaymentReviewResponse from(Payment payment) {
        return new AdminPaymentReviewResponse(
                payment.getId(),
                payment.getOrderId(),
                payment.getProvider(),
                payment.getProviderReference(),
                payment.getStatus(),
                payment.getAmountCents(),
                payment.getCurrency(),
                payment.getBankTranId(),
                payment.getReviewReason(),
                payment.getReviewAt(),
                payment.getRefundedAt(),
                payment.getCreatedAt());
    }
}