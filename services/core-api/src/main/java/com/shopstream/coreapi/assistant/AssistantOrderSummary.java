package com.shopstream.coreapi.assistant;

import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

import com.shopstream.coreapi.order.OrderStatus;

/** Customer safe order summary for the assistant. No address, phone or item details. */
public record AssistantOrderSummary(
        String orderCode,
        OrderStatus status,
        String currency,
        long totalCents,
        Instant createdAt) {

    /** Short code the customer can read out, for example 3F2A9C1E. */
    public static String orderCode(UUID id) {
        return id.toString().substring(0, 8).toUpperCase(Locale.ROOT);
    }
}