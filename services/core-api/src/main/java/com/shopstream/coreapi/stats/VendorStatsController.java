package com.shopstream.coreapi.stats;

import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/vendor/dashboard")
public class VendorStatsController {

    private final VendorStatsService service;

    public VendorStatsController(VendorStatsService service) {
        this.service = service;
    }

    /** GET /api/v1/vendor/dashboard?period=30d  (7d, 30d or all) */
    @GetMapping
    public VendorDashboardResponse dashboard(@AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "30d") String period) {
        return service.dashboard(UUID.fromString(jwt.getSubject()), period);
    }
}