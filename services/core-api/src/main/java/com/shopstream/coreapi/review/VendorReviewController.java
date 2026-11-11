package com.shopstream.coreapi.review;

import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shopstream.coreapi.common.PageResponse;

@RestController
@RequestMapping("/api/v1/vendor/reviews")
public class VendorReviewController {

    private final VendorReviewService service;

    public VendorReviewController(VendorReviewService service) {
        this.service = service;
    }

    @GetMapping
    public PageResponse<VendorReviewResponse> list(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        // No Sort here: the query already orders newest first.
        PageRequest pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100));
        return service.list(UUID.fromString(jwt.getSubject()), pageable);
    }
}