package com.shopstream.coreapi.catalog;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ProductResponse(
        UUID id,
        String name,
        String slug,
        String description,
        long priceCents,
        String currency,
        int stockQuantity,
        ProductStatus status,
        UUID categoryId,
        String categoryName,
        List<String> imageUrls,
        Instant createdAt,
        Instant updatedAt) {

    public static ProductResponse from(Product p) {
        return new ProductResponse(
                p.getId(),
                p.getName(),
                p.getSlug(),
                p.getDescription(),
                p.getPriceCents(),
                p.getCurrency(),
                p.getStockQuantity(),
                p.getStatus(),
                p.getCategory().getId(),
                p.getCategory().getName(),
                List.copyOf(p.getImageUrls()),
                p.getCreatedAt(),
                p.getUpdatedAt());
    }
}