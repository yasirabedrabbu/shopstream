package com.shopstream.coreapi.fulfillment;

import java.time.Instant;
import java.util.UUID;

import com.shopstream.coreapi.order.FulfillmentStatus;
import com.shopstream.coreapi.order.Order;
import com.shopstream.coreapi.order.OrderItem;
import com.shopstream.coreapi.order.ShippingAddress;

public record VendorOrderItemResponse(
        UUID itemId,
        UUID orderId,
        Instant placedAt,
        UUID productId,
        String productName,
        int quantity,
        long unitPriceCents,
        long lineTotalCents,
        String currency,
        FulfillmentStatus fulfillmentStatus,
        ShippingAddress shippingAddress) {

    public static VendorOrderItemResponse from(OrderItem item) {
        Order order = item.getOrder();
        return new VendorOrderItemResponse(
                item.getId(),
                order.getId(),
                order.getCreatedAt(),
                item.getProductId(),
                item.getProductName(),
                item.getQuantity(),
                item.getUnitPriceCents(),
                item.getLineTotalCents(),
                order.getCurrency(),
                item.getFulfillmentStatus(),
                order.getShippingAddress());
    }
}