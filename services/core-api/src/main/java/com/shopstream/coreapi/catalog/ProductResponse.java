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
        Long salePriceCents,
        Instant saleStartsAt,
        Instant saleEndsAt,
        boolean flashSaleActive,
        long effectivePriceCents,
        String currency,
        int stockQuantity,
        ProductStatus status,
        UUID categoryId,
        String categoryName,
        List<String> imageUrls,
        Instant createdAt,
        Instant updatedAt) {

    public static ProductResponse from(Product p) {
        Instant now = Instant.now();
        return new ProductResponse(
                p.getId(),
                p.getName(),
                p.getSlug(),
                p.getDescription(),
                p.getPriceCents(),
                p.getSalePriceCents(),
                p.getSaleStartsAt(),
                p.getSaleEndsAt(),
                p.isFlashSaleActive(now),
                p.effectivePriceCents(now),
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