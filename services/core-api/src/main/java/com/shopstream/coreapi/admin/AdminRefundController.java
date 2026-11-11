package com.shopstream.coreapi.admin;

import java.util.UUID;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/payments")
public class AdminRefundController {

    private final AdminRefundService refundService;

    public AdminRefundController(AdminRefundService refundService) {
        this.refundService = refundService;
    }

    /**
     * POST /api/v1/admin/payments/{paymentId}/refund?cancelOrder=true
     * cancelOrder defaults to true. Pass false if the order should stay open (rare).
     */
    @PostMapping("/{paymentId}/refund")
    public AdminPaymentReviewResponse refund(
            @PathVariable UUID paymentId,
            @RequestParam(defaultValue = "true") boolean cancelOrder) {
        return refundService.refund(paymentId, cancelOrder);
    }
}