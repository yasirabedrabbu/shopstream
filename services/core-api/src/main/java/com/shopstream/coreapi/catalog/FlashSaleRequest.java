package com.shopstream.coreapi.catalog;

import java.time.Instant;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record FlashSaleRequest(
        @NotNull @Min(0) Long salePriceCents,
        @NotNull Instant startsAt,
        @NotNull Instant endsAt) {
}