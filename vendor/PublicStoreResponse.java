package com.shopstream.coreapi.vendor;

public record PublicStoreResponse(
        String storeName,
        String slug,
        String description) {

    public static PublicStoreResponse from(Vendor vendor) {
        return new PublicStoreResponse(
                vendor.getStoreName(),
                vendor.getSlug(),
                vendor.getDescription());
    }
}