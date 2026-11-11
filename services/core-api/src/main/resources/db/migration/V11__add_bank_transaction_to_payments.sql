-- SSLCOMMERZ gives us the bank's transaction id when a payment succeeds. A refund needs it.
ALTER TABLE payments
    ADD COLUMN bank_tran_id VARCHAR(80),
    ADD COLUMN val_id       VARCHAR(50);