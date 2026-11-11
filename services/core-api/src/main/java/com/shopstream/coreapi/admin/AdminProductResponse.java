package com.shopstream.coreapi.admin;

import java.time.Instant;
import java.util.UUID;

import com.shopstream.coreapi.catalog.Product;
import com.shopstream.coreapi.catalog.ProductStatus;
import com.shopstream.coreapi.vendor.VendorStatus;

public record AdminProductResponse(
        UUID id,
        String name,
        String slug,
        long priceCents,
        String currency,
        int stockQuantity,
        ProductStatus status,
        String categoryName,
        UUID vendorId,
        String storeName,
        VendorStatus vendorStatus,
        Instant createdAt,
        Instant updatedAt) {

    public static AdminProductResponse from(Product p) {
        return new AdminProductResponse(
                p.getId(),
                p.getName(),
                p.getSlug(),
                p.getPriceCents(),
                p.getCurrency(),
                p.getStockQuantity(),
                p.getStatus(),
                p.getCategory().getName(),
                p.getVendor().getId(),
                p.getVendor().getStoreName(),
                p.getVendor().getStatus(),
                p.getCreatedAt(),
                p.getUpdatedAt());
    }
}