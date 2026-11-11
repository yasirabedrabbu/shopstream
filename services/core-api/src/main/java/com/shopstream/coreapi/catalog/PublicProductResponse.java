package com.shopstream.coreapi.catalog;

import java.util.List;
import java.util.UUID;

import com.shopstream.coreapi.vendor.PublicStoreResponse;

public record PublicProductResponse(
        UUID id,
        String name,
        String slug,
        String description,
        long priceCents,
        String currency,
        boolean inStock,
        CategoryResponse category,
        PublicStoreResponse store,
        List<String> imageUrls) {

    public static PublicProductResponse from(Product p) {
        return new PublicProductResponse(
                p.getId(),
                p.getName(),
                p.getSlug(),
                p.getDescription(),
                p.getPriceCents(),
                p.getCurrency(),
                p.getStockQuantity() > 0,
                CategoryResponse.from(p.getCategory()),
                PublicStoreResponse.from(p.getVendor()),
                List.copyOf(p.getImageUrls()));
    }
}