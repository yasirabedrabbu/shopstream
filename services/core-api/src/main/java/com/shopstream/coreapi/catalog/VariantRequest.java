package com.shopstream.coreapi.catalog;

import java.util.Map;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * options example: {"size": "M", "color": "Red"}. At most 3 option groups.
 * priceDeltaCents is added to the product price and may be negative.
 */
public record VariantRequest(
        @NotBlank @Size(max = 64) @Pattern(regexp = "^[A-Za-z0-9._-]+$",
                message = "sku may only contain letters, digits, dot, underscore and hyphen") String sku,
        @NotEmpty @Size(max = 3) Map<@NotBlank @Size(max = 40) String, @NotBlank @Size(max = 60) String> options,
        @NotNull Long priceDeltaCents,
        @NotNull @Min(0) Integer stockQuantity,
        Boolean active) {
}
