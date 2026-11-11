package com.shopstream.coreapi.catalog;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.shopstream.coreapi.vendor.Vendor;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "vendor_id", nullable = false, updatable = false)
    private Vendor vendor;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, unique = true, length = 240)
    private String slug;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "price_cents", nullable = false)
    private long priceCents;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(name = "stock_quantity", nullable = false)
    private int stockQuantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProductStatus status = ProductStatus.DRAFT;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @OrderColumn(name = "sort_order")
    @Column(name = "url", nullable = false, length = 1000)
    private List<String> imageUrls = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Product() {
    }

    public Product(Vendor vendor, Category category, String name, String slug, String description,
            long priceCents, String currency, int stockQuantity, ProductStatus status, List<String> imageUrls) {
        this.vendor = vendor;
        this.category = category;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.priceCents = priceCents;
        this.currency = currency;
        this.stockQuantity = stockQuantity;
        this.status = status;
        this.imageUrls = new ArrayList<>(imageUrls);
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

    public void update(Category category, String name, String description, long priceCents,
            String currency, int stockQuantity, List<String> imageUrls) {
        this.category = category;
        this.name = name;
        this.description = description;
        this.priceCents = priceCents;
        this.currency = currency;
        this.stockQuantity = stockQuantity;
        this.imageUrls.clear();
        this.imageUrls.addAll(imageUrls);
    }

    public void setStatus(ProductStatus status) {
        this.status = status;
    }

    public UUID getId() {
        return id;
    }

    public Vendor getVendor() {
        return vendor;
    }

    public Category getCategory() {
        return category;
    }

    public String getName() {
        return name;
    }

    public String getSlug() {
        return slug;
    }

    public String getDescription() {
        return description;
    }

    public long getPriceCents() {
        return priceCents;
    }

    public String getCurrency() {
        return currency;
    }

    public int getStockQuantity() {
        return stockQuantity;
    }

    public ProductStatus getStatus() {
        return status;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}