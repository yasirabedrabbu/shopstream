ALTER TABLE products
    ADD COLUMN sale_price_cents BIGINT,
    ADD COLUMN sale_starts_at   TIMESTAMPTZ,
    ADD COLUMN sale_ends_at     TIMESTAMPTZ;

ALTER TABLE products
    ADD CONSTRAINT ck_products_flash_sale CHECK (
        (sale_price_cents IS NULL AND sale_starts_at IS NULL AND sale_ends_at IS NULL)
        OR (sale_price_cents IS NOT NULL AND sale_starts_at IS NOT NULL AND sale_ends_at IS NOT NULL
            AND sale_price_cents >= 0 AND sale_ends_at > sale_starts_at)
    );

CREATE INDEX ix_products_flash_sale_window
    ON products (sale_starts_at, sale_ends_at)
    WHERE sale_price_cents IS NOT NULL;