package com.shopstream.coreapi.catalog;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record VariantResponse(
        UUID id,
        UUID productId,
        String sku,
        Map<String, String> options,
        long priceDeltaCents,
        long priceCents,
        int stockQuantity,
        boolean active,
        Instant createdAt,
        Instant updatedAt) {

    public static VariantResponse from(ProductVariant v, long productPriceCents) {
        return new VariantResponse(
                v.getId(),
                v.getProductId(),
                v.getSku(),
                Map.copyOf(v.getOptions()),
                v.getPriceDeltaCents(),
                productPriceCents + v.getPriceDeltaCents(),
                v.getStockQuantity(),
                v.isActive(),
                v.getCreatedAt(),
                v.getUpdatedAt());
    }
}
