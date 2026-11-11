package com.shopstream.coreapi.fulfillment;

import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shopstream.coreapi.common.PageResponse;
import com.shopstream.coreapi.order.FulfillmentStatus;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/vendor/orders")
public class VendorOrderController {

    private final FulfillmentService service;

    public VendorOrderController(FulfillmentService service) {
        this.service = service;
    }

    /** GET /api/v1/vendor/orders/items?status=NEW&page=0&size=20 */
    @GetMapping("/items")
    public PageResponse<VendorOrderItemResponse> list(@AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) FulfillmentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100));
        return service.list(userId(jwt), status, pageable);
    }

    /** PATCH /api/v1/vendor/orders/items/{itemId}/fulfillment  body: {"status":"PACKED"} */
    @PatchMapping("/items/{itemId}/fulfillment")
    public VendorOrderItemResponse advance(@AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID itemId,
            @Valid @RequestBody UpdateFulfillmentRequest request) {
        return service.advance(userId(jwt), itemId, request.status());
    }

    private static UUID userId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }
}