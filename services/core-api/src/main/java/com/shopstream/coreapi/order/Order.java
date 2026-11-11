package com.shopstream.coreapi.order;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "customer_id", nullable = false, updatable = false)
    private UUID customerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(name = "total_cents", nullable = false)
    private long totalCents;

    @Column(name = "reservation_expires_at")
    private Instant reservationExpiresAt;

    @Column(name = "cancel_reason", length = 255)
    private String cancelReason;

    @Embedded
    private ShippingAddress shippingAddress;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    protected Order() {
    }

    public Order(UUID customerId, String currency, ShippingAddress shippingAddress) {
        this.customerId = customerId;
        this.currency = currency;
        this.shippingAddress = shippingAddress;
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

    public void addItem(OrderItem item) {
        requireStatus(OrderStatus.PENDING);
        item.setOrder(this);
        items.add(item);
        totalCents = Math.addExact(totalCents, item.getLineTotalCents());
    }

    public void markAwaitingPayment(Instant reservationExpiresAt) {
        requireStatus(OrderStatus.PENDING);
        this.status = OrderStatus.AWAITING_PAYMENT;
        this.reservationExpiresAt = reservationExpiresAt;
    }

    public void markPaid() {
        requireStatus(OrderStatus.AWAITING_PAYMENT);
        this.status = OrderStatus.PAID;
    }

    public void cancel(String reason) {
        if (status == OrderStatus.PAID || status == OrderStatus.CANCELLED || status == OrderStatus.EXPIRED) {
            throw new IllegalStateException("Order cannot be cancelled from status " + status);
        }
        this.status = OrderStatus.CANCELLED;
        this.cancelReason = reason;
        items.forEach(OrderItem::cancel);
    }

    public void expire() {
        requireStatus(OrderStatus.AWAITING_PAYMENT);
        this.status = OrderStatus.EXPIRED;
        this.cancelReason = "Payment window expired";
        items.forEach(OrderItem::cancel);
    }

    private void requireStatus(OrderStatus expected) {
        if (status != expected) {
            throw new IllegalStateException("Expected order status " + expected + " but was " + status);
        }
    }

    public UUID getId() {
        return id;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public String getCurrency() {
        return currency;
    }

    public long getTotalCents() {
        return totalCents;
    }

    public Instant getReservationExpiresAt() {
        return reservationExpiresAt;
    }

    public String getCancelReason() {
        return cancelReason;
    }

    public ShippingAddress getShippingAddress() {
        return shippingAddress;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public List<OrderItem> getItems() {
        return Collections.unmodifiableList(items);
    }
}