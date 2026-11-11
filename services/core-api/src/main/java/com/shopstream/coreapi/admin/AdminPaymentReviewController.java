package com.shopstream.coreapi.admin;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shopstream.coreapi.common.PageResponse;
import com.shopstream.coreapi.payment.PaymentReviewReason;

@RestController
@RequestMapping("/api/v1/admin/payments/review")
public class AdminPaymentReviewController {

    private final AdminPaymentReviewService service;

    public AdminPaymentReviewController(AdminPaymentReviewService service) {
        this.service = service;
    }

    /** GET /api/v1/admin/payments/review?reason=HELD&page=0&size=20 (oldest waiting first) */
    @GetMapping
    public PageResponse<AdminPaymentReviewResponse> list(
            @RequestParam(required = false) PaymentReviewReason reason,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 100),
                Sort.by("reviewAt").ascending());
        Page<AdminPaymentReviewResponse> result = service.list(reason, pageable);
        return PageResponse.of(result, r -> r);
    }
}