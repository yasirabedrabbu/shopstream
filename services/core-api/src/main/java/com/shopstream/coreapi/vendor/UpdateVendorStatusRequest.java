package com.shopstream.coreapi.vendor;

import jakarta.validation.constraints.NotNull;

public record UpdateVendorStatusRequest(@NotNull VendorStatus status) {
}