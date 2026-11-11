package com.shopstream.coreapi.admin;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopstream.coreapi.common.ApiException;
import com.shopstream.coreapi.common.PageResponse;
import com.shopstream.coreapi.order.OrderStatus;

@Service
public class AdminReportService {

    // All products are USD for now. Mixed currencies are not supported by these sums.
    private static final String CURRENCY = "USD";
    private static final int TOP_VENDORS = 5;

    private final AdminReportRepository repository;
    private final int commissionPercent;

    public AdminReportService(AdminReportRepository repository,
            @Value("${app.marketplace.commission-percent}") int commissionPercent) {
        this.repository = repository;
        this.commissionPercent = commissionPercent;
    }

    @Transactional(readOnly = true)
    public PlatformStatsResponse stats(String period) {
        Integer days = switch (period.toLowerCase(Locale.ROOT)) {
            case "7d" -> 7;
            case "30d" -> 30;
            case "all" -> null;
            default -> throw new ApiException(HttpStatus.BAD_REQUEST, "period must be 7d, 30d or all");
        };

        Instant since = days == null
                ? Instant.EPOCH
                : LocalDate.now(ZoneOffset.UTC).minusDays(days - 1L).atStartOfDay(ZoneOffset.UTC).toInstant();

        AdminReportRepository.SalesTotals totals = repository.salesTotals(since);
        long gmv = totals.grossCents();
        long commission = Math.multiplyExact(gmv, (long) commissionPercent) / 100;

        return new PlatformStatsResponse(
                period.toLowerCase(Locale.ROOT),
                days == null ? null : since,
                CURRENCY,
                new PlatformStatsResponse.Sales(gmv, commission, totals.orders(), totals.units()),
                repository.usersByRole(),
                repository.vendorsByStatus(),
                repository.productsByStatus(),
                repository.ordersByStatus(),
                repository.topVendors(since, TOP_VENDORS));
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminOrderRow> orders(OrderStatus status, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        long total = repository.countOrders(status);
        List<AdminOrderRow> rows = repository.orders(status, safeSize, (long) safePage * safeSize);
        int totalPages = (int) ((total + safeSize - 1) / safeSize);
        return new PageResponse<>(rows, safePage, safeSize, total, totalPages);
    }
}