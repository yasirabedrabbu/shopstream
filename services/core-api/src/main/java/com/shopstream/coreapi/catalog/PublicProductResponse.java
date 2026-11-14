package com.shopstream.coreapi.catalog;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.shopstream.coreapi.vendor.PublicStoreResponse;

/** Public view. It never exposes cost price or the publish schedule. */
public record PublicProductResponse(
        UUID id,
        String name,
        String slug,
        String description,
        long priceCents,
        Long salePriceCents,
        Instant saleEndsAt,
        boolean flashSaleActive,
        long effectivePriceCents,
        String currency,
        boolean inStock,
        CategoryResponse category,
        PublicStoreResponse store,
        List<String> imageUrls,
        String seoTitle,
        String seoDescription,
        List<String> tags) {

    public static PublicProductResponse from(Product p) {
        Instant now = Instant.now();
        boolean onSale = p.isFlashSaleActive(now);
        return new PublicProductResponse(
                p.getId(),
                p.getName(),
                p.getSlug(),
                p.getDescription(),
                p.getPriceCents(),
                onSale ? p.getSalePriceCents() : null,
                onSale ? p.getSaleEndsAt() : null,
                onSale,
                p.effectivePriceCents(now),
                p.getCurrency(),
                p.getStockQuantity() > 0,
                CategoryResponse.from(p.getCategory()),
                PublicStoreResponse.from(p.getVendor()),
                List.copyOf(p.getImageUrls()),
                p.getSeoTitle(),
                p.getSeoDescription(),
                p.getTags().stream().sorted().toList());
    }
}
