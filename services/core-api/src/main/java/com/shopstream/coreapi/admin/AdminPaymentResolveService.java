package com.shopstream.coreapi.admin;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopstream.coreapi.common.ApiException;
import com.shopstream.coreapi.payment.Payment;
import com.shopstream.coreapi.payment.PaymentRepository;

@Service
public class AdminPaymentResolveService {

    private final PaymentRepository payments;

    public AdminPaymentResolveService(PaymentRepository payments) {
        this.payments = payments;
    }

    /**
     * Admin has looked at the payment and closes its review. This does not move any money.
     * To give the money back, use the refund endpoint, which also closes the review.
     */
    @Transactional
    public AdminPaymentReviewResponse resolve(UUID paymentId) {
        Payment payment = payments.findById(paymentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Payment not found"));
        if (payment.getReviewReason() == null) {
            throw new ApiException(HttpStatus.CONFLICT, "This payment is not under review");
        }
        if (payment.getReviewResolvedAt() != null) {
            throw new ApiException(HttpStatus.CONFLICT, "This review is already resolved");
        }
        payment.resolveReview();
        return AdminPaymentReviewResponse.from(payment);
    }
}