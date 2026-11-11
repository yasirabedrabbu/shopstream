ALTER TABLE orders
    ADD COLUMN ship_full_name   VARCHAR(120),
    ADD COLUMN ship_phone       VARCHAR(30),
    ADD COLUMN ship_line1       VARCHAR(200),
    ADD COLUMN ship_line2       VARCHAR(200),
    ADD COLUMN ship_city        VARCHAR(100),
    ADD COLUMN ship_state       VARCHAR(100),
    ADD COLUMN ship_postal_code VARCHAR(20),
    ADD COLUMN ship_country     VARCHAR(2);