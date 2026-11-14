-- Catalog v2: SEO, cost price, scheduled publish, tags, variants. Default currency becomes BDT.

ALTER TABLE products
    ADD COLUMN seo_title        VARCHAR(70),
    ADD COLUMN seo_description  VARCHAR(160),
    ADD COLUMN cost_price_cents BIGINT,
    ADD COLUMN publish_at       TIMESTAMPTZ;

ALTER TABLE products
    ADD CONSTRAINT ck_products_cost_price CHECK (cost_price_cents IS NULL OR cost_price_cents >= 0);

ALTER TABLE products ALTER COLUMN currency SET DEFAULT 'BDT';

ALTER TABLE products DROP CONSTRAINT ck_products_status;
ALTER TABLE products
    ADD CONSTRAINT ck_products_status
    CHECK (status IN ('DRAFT', 'SCHEDULED', 'ACTIVE', 'ARCHIVED', 'BLOCKED'));

ALTER TABLE products
    ADD CONSTRAINT ck_products_scheduled CHECK (status <> 'SCHEDULED' OR publish_at IS NOT NULL);

CREATE INDEX ix_products_scheduled ON products (publish_at) WHERE status = 'SCHEDULED';

CREATE TABLE product_tags (
    product_id UUID        NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    tag        VARCHAR(40) NOT NULL,
    PRIMARY KEY (product_id, tag)
);

CREATE INDEX ix_product_tags_tag ON product_tags (tag);

CREATE TABLE product_variants (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id        UUID        NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    sku               VARCHAR(64) NOT NULL,
    price_delta_cents BIGINT      NOT NULL DEFAULT 0,
    stock_quantity    INTEGER     NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    active            BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_product_variants_sku UNIQUE (product_id, sku)
);

CREATE INDEX ix_product_variants_product ON product_variants (product_id);

CREATE TABLE product_variant_options (
    variant_id   UUID        NOT NULL REFERENCES product_variants (id) ON DELETE CASCADE,
    option_name  VARCHAR(40) NOT NULL,
    option_value VARCHAR(60) NOT NULL,
    PRIMARY KEY (variant_id, option_name)
);
