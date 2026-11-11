package com.shopstream.coreapi.stats;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.shopstream.coreapi.order.FulfillmentStatus;

public record VendorDashboardResponse(
        String period,
        Instant from,
        String currency,
        Revenue revenue,
        Map<FulfillmentStatus, Long> pipeline,
        List<LowStock> lowStock,
        List<TopProduct> topProducts,
        List<DailyPoint> daily,
        List<RecentItem> recent) {

    public record Revenue(long grossCents, long commissionCents, long netCents, long orders, long units) {
    }

    public record LowStock(UUID productId, String name, String slug, int stockQuantity) {
    }

    public record TopProduct(UUID productId, String name, long unitsSold, long revenueCents) {
    }

    public record DailyPoint(LocalDate date, long grossCents, long orders) {
    }

    public record RecentItem(UUID itemId, UUID orderId, Instant paidAt, String productName, int quantity,
            long lineTotalCents, FulfillmentStatus fulfillmentStatus) {
    }
}