package com.shopstream.coreapi.payment;

/** Why a payment needs a person to look at it. Stored as text, must match ck_payments_review_reason. */
public enum PaymentReviewReason {
    HELD,
    LATE_PAYMENT,
    AMOUNT_MISMATCH,
    DUPLICATE_CHARGE
}