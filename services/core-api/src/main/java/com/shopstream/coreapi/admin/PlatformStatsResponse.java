package com.shopstream.coreapi.admin;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record PlatformStatsResponse(
        String period,
        Instant from,
        String currency,
        Sales sales,
        Map<String, Long> usersByRole,
        Map<String, Long> vendorsByStatus,
        Map<String, Long> productsByStatus,
        Map<String, Long> ordersByStatus,
        List<TopVendor> topVendors) {

    public record Sales(long gmvCents, long commissionCents, long paidOrders, long unitsSold) {
    }

    public record TopVendor(UUID vendorId, String storeName, long grossCents, long orders) {
    }
}