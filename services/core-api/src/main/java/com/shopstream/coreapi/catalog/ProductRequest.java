package com.shopstream.coreapi.catalog;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * On update, a null optional field (slug, seoTitle, seoDescription, costPriceCents, publishAt, tags)
 * means "leave unchanged", so older clients that do not send them never wipe data.
 * To clear a text field send an empty string, to clear tags send an empty list.
 */
public record ProductRequest(
        @NotBlank @Size(max = 200) String name,
        @Size(max = 5000) String description,
        @NotNull @Min(0) Long priceCents,
        @Size(min = 3, max = 3) String currency,
        @NotNull @Min(0) Integer stockQuantity,
        @NotNull UUID categoryId,
        @Size(max = 10) List<@NotBlank @Size(max = 1000) @Pattern(regexp = "^https?://\\S+$") String> imageUrls,
        ProductStatus status,
        @Size(max = 240) @Pattern(regexp = "^$|^[a-z0-9]+(-[a-z0-9]+)*$",
                message = "slug may only contain lowercase letters, digits and hyphens") String slug,
        @Size(max = 70) String seoTitle,
        @Size(max = 160) String seoDescription,
        @Min(0) Long costPriceCents,
        Instant publishAt,
        @Size(max = 20) List<@NotBlank @Size(max = 40) String> tags) {
}
