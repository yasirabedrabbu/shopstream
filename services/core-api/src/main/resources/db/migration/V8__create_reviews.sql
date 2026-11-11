CREATE TABLE reviews (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id    UUID         NOT NULL REFERENCES products (id),
    customer_id   UUID         NOT NULL REFERENCES users (id),
    rating        INTEGER      NOT NULL CHECK (rating BETWEEN 1 AND 5),
    body          VARCHAR(2000),
    reviewer_name VARCHAR(80)  NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT uq_reviews_product_customer UNIQUE (product_id, customer_id)
);

CREATE INDEX ix_reviews_product_created ON reviews (product_id, created_at DESC);
CREATE INDEX ix_reviews_customer ON reviews (customer_id);