package com.shopstream.coreapi.review;

import java.time.Instant;
import java.util.UUID;

import com.shopstream.coreapi.catalog.Product;

public record VendorReviewResponse(
        UUID reviewId,
        UUID productId,
        String productName,
        String productSlug,
        int rating,
        String comment,
        String reviewerName,
        Instant createdAt,
        Instant updatedAt) {

    /** row is (Review, Product), the shape ReviewRepository.findForVendor returns. */
    public static VendorReviewResponse from(Object[] row) {
        Review r = (Review) row[0];
        Product p = (Product) row[1];
        return new VendorReviewResponse(
                r.getId(),
                p.getId(),
                p.getName(),
                p.getSlug(),
                r.getRating(),
                r.getComment(),
                r.getReviewerName(),
                r.getCreatedAt(),
                r.getUpdatedAt());
    }
}