-- The status CHECK on products was created inline in V2, so Postgres generated its name.
-- Find it by its definition, drop it, then add one that also allows BLOCKED.
DO $$
DECLARE
    c text;
BEGIN
    FOR c IN
        SELECT conname FROM pg_constraint
        WHERE conrelid = 'products'::regclass
          AND contype = 'c'
          AND pg_get_constraintdef(oid) LIKE '%DRAFT%'
    LOOP
        EXECUTE format('ALTER TABLE products DROP CONSTRAINT %I', c);
    END LOOP;
END $$;

ALTER TABLE products
    ADD CONSTRAINT ck_products_status CHECK (status IN ('DRAFT', 'ACTIVE', 'ARCHIVED', 'BLOCKED'));