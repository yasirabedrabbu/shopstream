package com.shopstream.coreapi.vendor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VendorRequest(
        @NotBlank @Size(max = 120) String storeName,
        @Size(max = 2000) String description) {
}