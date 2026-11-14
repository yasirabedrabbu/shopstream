package com.shopstream.coreapi.catalog;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapKeyColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

/** One sellable combination of a product, for example size M and color Red. */
@Entity
@Table(name = "product_variants")
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "product_id", nullable = false, updatable = false)
    private UUID productId;

    @Column(nullable = false, length = 64)
    private String sku;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_variant_options", joinColumns = @JoinColumn(name = "variant_id"))
    @MapKeyColumn(name = "option_name", length = 40)
    @Column(name = "option_value", nullable = false, length = 60)
    private Map<String, String> options = new LinkedHashMap<>();

    @Column(name = "price_delta_cents", nullable = false)
    private long priceDeltaCents;

    @Column(name = "stock_quantity", nullable = false)
    private int stockQuantity;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected ProductVariant() {
    }

    public ProductVariant(UUID productId, String sku, Map<String, String> options,
            long priceDeltaCents, int stockQuantity, boolean active) {
        this.productId = productId;
        this.sku = sku;
        this.options = new LinkedHashMap<>(options);
        this.priceDeltaCents = priceDeltaCents;
        this.stockQuantity = stockQuantity;
        this.active = active;
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

    public void update(String sku, Map<String, String> options, long priceDeltaCents,
            int stockQuantity, boolean active) {
        this.sku = sku;
        this.options.clear();
        this.options.putAll(options);
        this.priceDeltaCents = priceDeltaCents;
        this.stockQuantity = stockQuantity;
        this.active = active;
    }

    public UUID getId() {
        return id;
    }

    public UUID getProductId() {
        return productId;
    }

    public String getSku() {
        return sku;
    }

    public Map<String, String> getOptions() {
        return options;
    }

    public long getPriceDeltaCents() {
        return priceDeltaCents;
    }

    public int getStockQuantity() {
        return stockQuantity;
    }

    public boolean isActive() {
        return active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
