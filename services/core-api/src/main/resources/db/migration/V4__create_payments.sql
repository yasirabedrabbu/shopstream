CREATE TABLE payments (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id           UUID         NOT NULL REFERENCES orders (id),
    provider           VARCHAR(20)  NOT NULL
                       CHECK (provider IN ('MOCK', 'STRIPE', 'SSLCOMMERZ', 'BKASH')),
    provider_reference VARCHAR(255),
    status             VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
                       CHECK (status IN ('PENDING', 'SUCCEEDED', 'FAILED')),
    amount_cents       BIGINT       NOT NULL CHECK (amount_cents >= 0),
    currency           VARCHAR(3)   NOT NULL,
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX ix_payments_order ON payments (order_id);

CREATE UNIQUE INDEX ux_payments_provider_ref
    ON payments (provider, provider_reference)
    WHERE provider_reference IS NOT NULL;

-- One row per webhook event we already handled. Stops double-processing on provider retries.
CREATE TABLE payment_events (
    provider    VARCHAR(20)  NOT NULL,
    event_id    VARCHAR(255) NOT NULL,
    received_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    PRIMARY KEY (provider, event_id)
);