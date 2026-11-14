package com.shopstream.coreapi.catalog;

import java.time.Instant;
import java.util.Locale;

import org.springframework.data.jpa.domain.Specification;

import com.shopstream.coreapi.vendor.VendorStatus;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

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

    /** Filters on the price the customer actually pays at this moment (sale price while a sale is live). */
    public static Specification<Product> minPrice(long cents, Instant now) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(effectivePrice(root, cb, now), cents);
    }

    public static Specification<Product> maxPrice(long cents, Instant now) {
        return (root, query, cb) -> cb.lessThanOrEqualTo(effectivePrice(root, cb, now), cents);
    }

    private static Expression<Long> effectivePrice(Root<Product> root, CriteriaBuilder cb, Instant now) {
        Predicate saleLive = cb.and(
                cb.isNotNull(root.get("salePriceCents")),
                cb.lessThanOrEqualTo(root.<Instant>get("saleStartsAt"), now),
                cb.greaterThan(root.<Instant>get("saleEndsAt"), now));
        return cb.<Long>selectCase()
                .when(saleLive, root.<Long>get("salePriceCents"))
                .otherwise(root.<Long>get("priceCents"));
    }

    private static String escapeLike(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
