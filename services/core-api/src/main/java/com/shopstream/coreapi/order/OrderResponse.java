package com.shopstream.coreapi.order;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        OrderStatus status,
        String currency,
        long totalCents,
        Instant reservationExpiresAt,
        String cancelReason,
        Instant createdAt,
        List<Item> items) {

    public record Item(
            UUID id,
            UUID productId,
            UUID vendorId,
            String productName,
            long unitPriceCents,
            int quantity,
            long lineTotalCents,
            FulfillmentStatus fulfillmentStatus) {

        static Item from(OrderItem item) {
            return new Item(
                    item.getId(),
                    item.getProductId(),
                    item.getVendorId(),
                    item.getProductName(),
                    item.getUnitPriceCents(),
                    item.getQuantity(),
                    item.getLineTotalCents(),
                    item.getFulfillmentStatus());
        }
    }

    public static OrderResponse from(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getStatus(),
                order.getCurrency(),
                order.getTotalCents(),
                order.getReservationExpiresAt(),
                order.getCancelReason(),
                order.getCreatedAt(),
                order.getItems().stream().map(Item::from).toList());
    }
}