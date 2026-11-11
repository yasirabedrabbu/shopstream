package com.shopstream.coreapi.payment;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "order_id", nullable = false, updatable = false)
    private UUID orderId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, updatable = false, length = 20)
    private PaymentProvider provider;

    @Column(name = "provider_reference", length = 255)
    private String providerReference;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "amount_cents", nullable = false, updatable = false)
    private long amountCents;

    @Column(nullable = false, updatable = false, length = 3)
    private String currency;

    @Column(name = "bank_tran_id", length = 80)
    private String bankTranId;

    @Column(name = "val_id", length = 50)
    private String valId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Payment() {
    }

    public Payment(UUID orderId, PaymentProvider provider, long amountCents, String currency) {
        this.orderId = orderId;
        this.provider = provider;
        this.amountCents = amountCents;
        this.currency = currency;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public void attachReference(String providerReference) {
        this.providerReference = providerReference;
    }

    /** Empty values never overwrite what we already know. */
    public void attachBankDetails(String bankTranId, String valId) {
        if (bankTranId != null && !bankTranId.isBlank()) {
            this.bankTranId = bankTranId;
        }
        if (valId != null && !valId.isBlank()) {
            this.valId = valId;
        }
    }

    public void markSucceeded() {
        // The provider's word wins. A payment we retired (FAILED) can still be paid late by the customer.
        this.status = PaymentStatus.SUCCEEDED;
    }

    public void markFailed() {
        if (status == PaymentStatus.SUCCEEDED) {
            throw new IllegalStateException("A succeeded payment cannot fail");
        }
        this.status = PaymentStatus.FAILED;
    }

    public UUID getId() {
        return id;
    }

    public UUID getOrderId() {
        return orderId;
    }

    public PaymentProvider getProvider() {
        return provider;
    }

    public String getProviderReference() {
        return providerReference;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public long getAmountCents() {
        return amountCents;
    }

    public String getCurrency() {
        return currency;
    }

    public String getBankTranId() {
        return bankTranId;
    }

    public String getValId() {
        return valId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}