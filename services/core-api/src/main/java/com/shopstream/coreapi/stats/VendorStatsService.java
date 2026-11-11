package com.shopstream.coreapi.stats;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopstream.coreapi.common.ApiException;
import com.shopstream.coreapi.stats.VendorDashboardResponse.DailyPoint;
import com.shopstream.coreapi.stats.VendorDashboardResponse.Revenue;
import com.shopstream.coreapi.vendor.VendorService;

@Service
public class VendorStatsService {

    // All products are USD for now. Mixed currencies are not supported by these sums.
    private static final String CURRENCY = "USD";
    private static final int ALL_TIME_DAILY_DAYS = 90;
    private static final int TOP_PRODUCTS = 5;
    private static final int RECENT_ITEMS = 10;

    private final VendorStatsRepository stats;
    private final VendorService vendors;
    private final int commissionPercent;
    private final int lowStockThreshold;

    public VendorStatsService(VendorStatsRepository stats, VendorService vendors,
            @Value("${app.marketplace.commission-percent}") int commissionPercent,
            @Value("${app.marketplace.low-stock-threshold}") int lowStockThreshold) {
        this.stats = stats;
        this.vendors = vendors;
        this.commissionPercent = commissionPercent;
        this.lowStockThreshold = lowStockThreshold;
    }

    @Transactional(readOnly = true)
    public VendorDashboardResponse dashboard(UUID ownerUserId, String period) {
        Integer days = switch (period.toLowerCase(Locale.ROOT)) {
            case "7d" -> 7;
            case "30d" -> 30;
            case "all" -> null;
            default -> throw new ApiException(HttpStatus.BAD_REQUEST, "period must be 7d, 30d or all");
        };

        UUID vendorId = vendors.getMine(ownerUserId).getId();

        int dailyDays = days == null ? ALL_TIME_DAILY_DAYS : days;
        LocalDate firstDay = LocalDate.now(ZoneOffset.UTC).minusDays(dailyDays - 1L);
        Instant dailyFrom = firstDay.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant since = days == null ? Instant.EPOCH : dailyFrom;

        VendorStatsRepository.Totals totals = stats.totals(vendorId, since);
        long gross = totals.grossCents();
        long commission = Math.multiplyExact(gross, (long) commissionPercent) / 100;
        Revenue revenue = new Revenue(gross, commission, gross - commission, totals.orders(), totals.units());

        Map<LocalDate, DailyPoint> found = stats.daily(vendorId, dailyFrom);
        List<DailyPoint> daily = new ArrayList<>(dailyDays);
        for (int i = 0; i < dailyDays; i++) {
            LocalDate date = firstDay.plusDays(i);
            daily.add(found.getOrDefault(date, new DailyPoint(date, 0, 0)));
        }

        return new VendorDashboardResponse(
                period.toLowerCase(Locale.ROOT),
                days == null ? null : since,
                CURRENCY,
                revenue,
                stats.pipeline(vendorId),
                stats.lowStock(vendorId, lowStockThreshold),
                stats.topProducts(vendorId, since, TOP_PRODUCTS),
                daily,
                stats.recent(vendorId, RECENT_ITEMS));
    }
}