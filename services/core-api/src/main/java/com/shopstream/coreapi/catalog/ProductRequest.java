package com.shopstream.coreapi.catalog;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ProductRequest(
        @NotBlank @Size(max = 200) String name,
        @Size(max = 5000) String description,
        @NotNull @Min(0) Long priceCents,
        @Size(min = 3, max = 3) String currency,
        @NotNull @Min(0) Integer stockQuantity,
        @NotNull UUID categoryId,
        @Size(max = 10) List<@NotBlank @Size(max = 1000) @Pattern(regexp = "^https?://\\S+$") String> imageUrls,
        ProductStatus status) {
}