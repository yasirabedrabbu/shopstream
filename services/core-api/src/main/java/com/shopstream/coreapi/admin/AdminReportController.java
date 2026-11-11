package com.shopstream.coreapi.admin;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shopstream.coreapi.common.PageResponse;
import com.shopstream.coreapi.order.OrderStatus;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminReportController {

    private final AdminReportService service;

    public AdminReportController(AdminReportService service) {
        this.service = service;
    }

    /** GET /api/v1/admin/orders?status=PAID&page=0&size=20 */
    @GetMapping("/orders")
    public PageResponse<AdminOrderRow> orders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return service.orders(status, page, size);
    }

    /** GET /api/v1/admin/stats?period=30d  (7d, 30d or all) */
    @GetMapping("/stats")
    public PlatformStatsResponse stats(@RequestParam(defaultValue = "30d") String period) {
        return service.stats(period);
    }
}