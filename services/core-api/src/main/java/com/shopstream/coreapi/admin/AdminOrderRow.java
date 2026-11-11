package com.shopstream.coreapi.admin;

import java.time.Instant;
import java.util.UUID;

import com.shopstream.coreapi.order.OrderStatus;

public record AdminOrderRow(
        UUID id,
        OrderStatus status,
        String currency,
        long totalCents,
        int itemCount,
        String customerEmail,
        Instant createdAt,
        Instant paidAt) {
}