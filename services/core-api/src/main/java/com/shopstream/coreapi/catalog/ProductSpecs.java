package com.shopstream.coreapi.catalog;

import java.time.Instant;
import java.util.Locale;

import org.springframework.data.jpa.domain.Specification;

import com.shopstream.coreapi.vendor.VendorStatus;

public final class ProductSpecs {

    private ProductSpecs() {
    }

    public static Specification<Product> publiclyVisible() {
        return (root, query, cb) -> cb.and(
                cb.equal(root.get("status"), ProductStatus.ACTIVE),
                cb.equal(root.get("vendor").get("status"), VendorStatus.APPROVED));
    }

    /** Sale window is open: start inclusive, end exclusive. Same rule as Product.isFlashSaleActive. */
    public static Specification<Product> flashSaleActive(Instant now) {
        return (root, query, cb) -> cb.and(
                cb.isNotNull(root.get("salePriceCents")),
                cb.lessThanOrEqualTo(root.<Instant>get("saleStartsAt"), now),
                cb.greaterThan(root.<Instant>get("saleEndsAt"), now));
    }

    public static Specification<Product> nameContains(String text) {
        String pattern = "%" + escapeLike(text.toLowerCase(Locale.ROOT)) + "%";
        return (root, query, cb) -> cb.like(cb.lower(root.get("name")), pattern, '\\');
    }

    public static Specification<Product> inCategory(String categorySlug) {
        return (root, query, cb) -> cb.equal(root.get("category").get("slug"), categorySlug);
    }

    public static Specification<Product> fromStore(String storeSlug) {
        return (root, query, cb) -> cb.equal(root.get("vendor").get("slug"), storeSlug);
    }

    public static Specification<Product> minPrice(long cents) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.<Long>get("priceCents"), cents);
    }

    public static Specification<Product> maxPrice(long cents) {
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.<Long>get("priceCents"), cents);
    }

    private static String escapeLike(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}