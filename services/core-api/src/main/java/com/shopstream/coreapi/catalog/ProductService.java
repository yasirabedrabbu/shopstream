package com.shopstream.coreapi.catalog;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopstream.coreapi.common.ApiException;
import com.shopstream.coreapi.common.Slugs;
import com.shopstream.coreapi.vendor.Vendor;
import com.shopstream.coreapi.vendor.VendorRepository;
import com.shopstream.coreapi.vendor.VendorStatus;

@Service
public class ProductService {

    private static final Duration MAX_SALE_DURATION = Duration.ofDays(30);

    public record Filter(String q, String category, String store, Long minPrice, Long maxPrice) {
    }

    private final ProductRepository products;
    private final CategoryRepository categories;
    private final VendorRepository vendors;

    public ProductService(ProductRepository products, CategoryRepository categories, VendorRepository vendors) {
        this.products = products;
        this.categories = categories;
        this.vendors = vendors;
    }

    // ---------- vendor side ----------

    @Transactional
    public Product create(UUID ownerId, ProductRequest request) {
        Vendor vendor = requireVendor(ownerId);
        Category category = requireCategory(request.categoryId());
        ProductStatus status = request.status() == null ? ProductStatus.DRAFT : request.status();
        ensurePublishable(vendor, status);

        String name = request.name().trim();
        Product product = new Product(
                vendor,
                category,
                name,
                uniqueSlug(name),
                cleanDescription(request.description()),
                request.priceCents(),
                normalizeCurrency(request.currency()),
                request.stockQuantity(),
                status,
                normalizeImages(request.imageUrls()));
        return products.save(product);
    }

    @Transactional
    public Product update(UUID ownerId, UUID productId, ProductRequest request) {
        Product product = findOwned(ownerId, productId);
        requireNotBlocked(product);
        Category category = requireCategory(request.categoryId());

        if (product.hasFlashSale() && request.priceCents() <= product.getSalePriceCents()) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Regular price must stay above the flash sale price. Remove the flash sale first.");
        }

        if (request.status() != null) {
            ensurePublishable(product.getVendor(), request.status());
            product.setStatus(request.status());
        }
        product.update(
                category,
                request.name().trim(),
                cleanDescription(request.description()),
                request.priceCents(),
                normalizeCurrency(request.currency()),
                request.stockQuantity(),
                normalizeImages(request.imageUrls()));
        return product;
    }

    @Transactional
    public Product archive(UUID ownerId, UUID productId) {
        Product product = findOwned(ownerId, productId);
        requireNotBlocked(product);
        product.setStatus(ProductStatus.ARCHIVED);
        return product;
    }

    @Transactional
    public Product setFlashSale(UUID ownerId, UUID productId, FlashSaleRequest request) {
        Product product = findOwned(ownerId, productId);
        requireNotBlocked(product);
        if (product.getStatus() == ProductStatus.ARCHIVED) {
            throw new ApiException(HttpStatus.CONFLICT, "Archived products cannot have a flash sale");
        }

        long salePrice = request.salePriceCents();
        Instant startsAt = request.startsAt();
        Instant endsAt = request.endsAt();

        if (salePrice >= product.getPriceCents()) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Sale price must be lower than the regular price");
        }
        if (!endsAt.isAfter(startsAt)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Sale end must be after sale start");
        }
        if (!endsAt.isAfter(Instant.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Sale end must be in the future");
        }
        if (Duration.between(startsAt, endsAt).compareTo(MAX_SALE_DURATION) > 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "A flash sale can run for 30 days at most");
        }

        product.scheduleFlashSale(salePrice, startsAt, endsAt);
        return product;
    }

    @Transactional
    public Product clearFlashSale(UUID ownerId, UUID productId) {
        Product product = findOwned(ownerId, productId);
        product.clearFlashSale();
        return product;
    }

    @Transactional(readOnly = true)
    public Product getMine(UUID ownerId, UUID productId) {
        return findOwned(ownerId, productId);
    }

    @Transactional(readOnly = true)
    public Page<Product> listMine(UUID ownerId, ProductStatus status, Pageable pageable) {
        Vendor vendor = requireVendor(ownerId);
        return status == null
                ? products.findByVendorId(vendor.getId(), pageable)
                : products.findByVendorIdAndStatus(vendor.getId(), status, pageable);
    }

    // ---------- public side ----------

    @Transactional(readOnly = true)
    public Page<Product> search(Filter filter, Pageable pageable) {
        Specification<Product> spec = ProductSpecs.publiclyVisible();

        if (filter.q() != null && !filter.q().isBlank()) {
            spec = spec.and(ProductSpecs.nameContains(filter.q().trim()));
        }
        if (filter.category() != null && !filter.category().isBlank()) {
            spec = spec.and(ProductSpecs.inCategory(filter.category().trim()));
        }
        if (filter.store() != null && !filter.store().isBlank()) {
            spec = spec.and(ProductSpecs.fromStore(filter.store().trim()));
        }
        if (filter.minPrice() != null) {
            spec = spec.and(ProductSpecs.minPrice(filter.minPrice()));
        }
        if (filter.maxPrice() != null) {
            spec = spec.and(ProductSpecs.maxPrice(filter.maxPrice()));
        }
        return products.findAll(spec, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Product> activeFlashSales(Pageable pageable) {
        Specification<Product> spec = ProductSpecs.publiclyVisible()
                .and(ProductSpecs.flashSaleActive(Instant.now()));
        return products.findAll(spec, pageable);
    }

    @Transactional(readOnly = true)
    public Product getPublicBySlug(String slug) {
        return products.findBySlugAndStatusAndVendorStatus(slug, ProductStatus.ACTIVE, VendorStatus.APPROVED)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    // ---------- helpers ----------

    private Vendor requireVendor(UUID ownerId) {
        return vendors.findByOwnerUserId(ownerId)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Create your store first"));
    }

    private Category requireCategory(UUID categoryId) {
        return categories.findById(categoryId)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Category not found"));
    }

    private Product findOwned(UUID ownerId, UUID productId) {
        Product product = products.findById(productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
        if (!product.getVendor().getOwnerUserId().equals(ownerId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Product not found");
        }
        return product;
    }

    private static void requireNotBlocked(Product product) {
        if (product.getStatus() == ProductStatus.BLOCKED) {
            throw new ApiException(HttpStatus.FORBIDDEN, "This product was blocked by an admin. Contact support.");
        }
    }

    private static void ensurePublishable(Vendor vendor, ProductStatus status) {
        if (status == ProductStatus.BLOCKED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only an admin can set this status");
        }
        if (status == ProductStatus.ACTIVE && vendor.getStatus() != VendorStatus.APPROVED) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Your store must be approved before products can go live");
        }
    }

    private String uniqueSlug(String name) {
        String base = Slugs.slugify(name, "product");
        String candidate = base;
        int suffix = 2;
        while (products.existsBySlug(candidate)) {
            candidate = base + "-" + suffix++;
        }
        return candidate;
    }

    private static String cleanDescription(String description) {
        if (description == null || description.isBlank()) {
            return null;
        }
        return description.trim();
    }

    private static String normalizeCurrency(String currency) {
        if (currency == null || currency.isBlank()) {
            return "USD";
        }
        return currency.trim().toUpperCase(Locale.ROOT);
    }

    private static List<String> normalizeImages(List<String> urls) {
        if (urls == null) {
            return List.of();
        }
        return urls.stream().map(String::trim).toList();
    }
}