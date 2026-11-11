CREATE TABLE orders (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id            UUID         NOT NULL REFERENCES users (id),
    status                 VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
                           CHECK (status IN ('PENDING', 'AWAITING_PAYMENT', 'PAID', 'CANCELLED', 'EXPIRED')),
    currency               VARCHAR(3)   NOT NULL DEFAULT 'USD',
    total_cents            BIGINT       NOT NULL CHECK (total_cents >= 0),
    reservation_expires_at TIMESTAMPTZ,
    cancel_reason          VARCHAR(255),
    created_at             TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX ix_orders_customer ON orders (customer_id);
CREATE INDEX ix_orders_status ON orders (status);

CREATE TABLE order_items (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id           UUID         NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    product_id         UUID         NOT NULL REFERENCES products (id),
    vendor_id          UUID         NOT NULL REFERENCES vendors (id),
    product_name       VARCHAR(200) NOT NULL,
    unit_price_cents   BIGINT       NOT NULL CHECK (unit_price_cents >= 0),
    quantity           INTEGER      NOT NULL CHECK (quantity > 0),
    line_total_cents   BIGINT       NOT NULL CHECK (line_total_cents >= 0),
    fulfillment_status VARCHAR(20)  NOT NULL DEFAULT 'NEW'
                       CHECK (fulfillment_status IN ('NEW', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'))
);

CREATE INDEX ix_order_items_order ON order_items (order_id);
CREATE INDEX ix_order_items_vendor ON order_items (vendor_id);
CREATE INDEX ix_order_items_product ON order_items (product_id);