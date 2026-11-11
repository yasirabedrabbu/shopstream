package com.shopstream.coreapi.vendor;

import java.time.Instant;
import java.util.UUID;

public record VendorResponse(
        UUID id,
        UUID ownerUserId,
        String storeName,
        String slug,
        String description,
        VendorStatus status,
        Instant createdAt) {

    public static VendorResponse from(Vendor vendor) {
        return new VendorResponse(
                vendor.getId(),
                vendor.getOwnerUserId(),
                vendor.getStoreName(),
                vendor.getSlug(),
                vendor.getDescription(),
                vendor.getStatus(),
                vendor.getCreatedAt());
    }
}