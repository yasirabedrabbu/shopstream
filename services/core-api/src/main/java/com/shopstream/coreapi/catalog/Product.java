package com.shopstream.coreapi.catalog;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
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

    @Column(name = "sale_price_cents")
    private Long salePriceCents;

    @Column(name = "sale_starts_at")
    private Instant saleStartsAt;

    @Column(name = "sale_ends_at")
    private Instant saleEndsAt;

    @Column(name = "seo_title", length = 70)
    private String seoTitle;

    @Column(name = "seo_description", length = 160)
    private String seoDescription;

    @Column(name = "cost_price_cents")
    private Long costPriceCents;

    @Column(name = "publish_at")
    private Instant publishAt;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @OrderColumn(name = "sort_order")
    @Column(name = "url", nullable = false, length = 1000)
    private List<String> imageUrls = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_tags", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "tag", nullable = false, length = 40)
    private Set<String> tags = new LinkedHashSet<>();

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

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public void setSeoTitle(String seoTitle) {
        this.seoTitle = seoTitle;
    }

    public void setSeoDescription(String seoDescription) {
        this.seoDescription = seoDescription;
    }

    public void setCostPriceCents(Long costPriceCents) {
        this.costPriceCents = costPriceCents;
    }

    public void setPublishAt(Instant publishAt) {
        this.publishAt = publishAt;
    }

    public void replaceTags(Set<String> newTags) {
        this.tags.clear();
        this.tags.addAll(newTags);
    }

    // ---------- flash sale ----------

    public void scheduleFlashSale(long salePriceCents, Instant startsAt, Instant endsAt) {
        this.salePriceCents = salePriceCents;
        this.saleStartsAt = startsAt;
        this.saleEndsAt = endsAt;
    }

    public void clearFlashSale() {
        this.salePriceCents = null;
        this.saleStartsAt = null;
        this.saleEndsAt = null;
    }

    public boolean hasFlashSale() {
        return salePriceCents != null;
    }

    /** True only while now is inside the window: start inclusive, end exclusive. */
    public boolean isFlashSaleActive(Instant now) {
        return salePriceCents != null
                && !now.isBefore(saleStartsAt)
                && now.isBefore(saleEndsAt);
    }

    /** The price a customer pays right now. */
    public long effectivePriceCents(Instant now) {
        return isFlashSaleActive(now) ? salePriceCents : priceCents;
    }

    // ---------- getters ----------

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

    public Long getSalePriceCents() {
        return salePriceCents;
    }

    public Instant getSaleStartsAt() {
        return saleStartsAt;
    }

    public Instant getSaleEndsAt() {
        return saleEndsAt;
    }

    public String getSeoTitle() {
        return seoTitle;
    }

    public String getSeoDescription() {
        return seoDescription;
    }

    public Long getCostPriceCents() {
        return costPriceCents;
    }

    public Instant getPublishAt() {
        return publishAt;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public Set<String> getTags() {
        return tags;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
