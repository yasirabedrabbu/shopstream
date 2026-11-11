-- Payments that need a person to look at them (risky, late, wrong amount, double charge),
-- and the refund details once an admin refunds one.
ALTER TABLE payments
    ADD COLUMN review_reason      VARCHAR(30),
    ADD COLUMN review_at          TIMESTAMPTZ,
    ADD COLUMN review_resolved_at TIMESTAMPTZ,
    ADD COLUMN refunded_at        TIMESTAMPTZ,
    ADD COLUMN refund_ref         VARCHAR(80);

ALTER TABLE payments
    ADD CONSTRAINT ck_payments_review_reason
        CHECK (review_reason IS NULL
               OR review_reason IN ('HELD', 'LATE_PAYMENT', 'AMOUNT_MISMATCH', 'DUPLICATE_CHARGE')),
    ADD CONSTRAINT ck_payments_review_resolved
        CHECK (review_resolved_at IS NULL OR review_reason IS NOT NULL);

-- The admin "needs review" list only reads unresolved rows.
CREATE INDEX ix_payments_review_open
    ON payments (review_at)
    WHERE review_reason IS NOT NULL AND review_resolved_at IS NULL;