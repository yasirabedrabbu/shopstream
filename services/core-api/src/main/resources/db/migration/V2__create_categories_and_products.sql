CREATE TABLE categories (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(100) NOT NULL,
    slug       VARCHAR(120) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE products (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id      UUID         NOT NULL REFERENCES vendors (id),
    category_id    UUID         NOT NULL REFERENCES categories (id),
    name           VARCHAR(200) NOT NULL,
    slug           VARCHAR(240) NOT NULL UNIQUE,
    description    TEXT,
    price_cents    BIGINT       NOT NULL CHECK (price_cents >= 0),
    currency       VARCHAR(3)   NOT NULL DEFAULT 'USD',
    stock_quantity INTEGER      NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    status         VARCHAR(20)  NOT NULL DEFAULT 'DRAFT'
                   CHECK (status IN ('DRAFT', 'ACTIVE', 'ARCHIVED')),
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX ix_products_vendor ON products (vendor_id);
CREATE INDEX ix_products_category ON products (category_id);
CREATE INDEX ix_products_status ON products (status);

CREATE TABLE product_images (
    product_id UUID          NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    sort_order INTEGER       NOT NULL,
    url        VARCHAR(1000) NOT NULL,
    PRIMARY KEY (product_id, sort_order)
);