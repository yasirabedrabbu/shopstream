ALTER TABLE orders ADD COLUMN paid_at TIMESTAMPTZ;

-- Purono PAID order-er jonno updated_at ke paid_at dhora hoy
UPDATE orders SET paid_at = updated_at WHERE status = 'PAID' AND paid_at IS NULL;

-- PAID order-e paid_at thakbei
ALTER TABLE orders ADD CONSTRAINT ck_orders_paid_at
    CHECK (status <> 'PAID' OR paid_at IS NOT NULL);

CREATE INDEX ix_orders_paid_at ON orders (paid_at) WHERE paid_at IS NOT NULL;