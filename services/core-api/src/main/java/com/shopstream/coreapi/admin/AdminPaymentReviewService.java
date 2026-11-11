package com.shopstream.coreapi.admin;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopstream.coreapi.payment.Payment;
import com.shopstream.coreapi.payment.PaymentRepository;
import com.shopstream.coreapi.payment.PaymentReviewReason;

@Service
public class AdminPaymentReviewService {

    private final PaymentRepository payments;

    public AdminPaymentReviewService(PaymentRepository payments) {
        this.payments = payments;
    }

    /** Payments still waiting for a person. reason == null means all reasons. */
    @Transactional(readOnly = true)
    public Page<AdminPaymentReviewResponse> list(PaymentReviewReason reason, Pageable pageable) {
        Page<Payment> result = reason == null
                ? payments.findByReviewReasonIsNotNullAndReviewResolvedAtIsNull(pageable)
                : payments.findByReviewReasonAndReviewResolvedAtIsNull(reason, pageable);
        return result.map(AdminPaymentReviewResponse::from);
    }
}