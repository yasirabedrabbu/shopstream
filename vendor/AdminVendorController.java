package com.shopstream.coreapi.vendor;

import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shopstream.coreapi.common.PageResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/admin/vendors")
public class AdminVendorController {

    private final VendorService vendorService;

    public AdminVendorController(VendorService vendorService) {
        this.vendorService = vendorService;
    }

    @GetMapping
    public PageResponse<VendorResponse> list(
            @RequestParam(required = false) VendorStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 100),
                Sort.by("createdAt").descending());
        return PageResponse.of(vendorService.list(status, pageable), VendorResponse::from);
    }

    @PatchMapping("/{id}/status")
    public VendorResponse changeStatus(@PathVariable UUID id, @Valid @RequestBody UpdateVendorStatusRequest request) {
        return VendorResponse.from(vendorService.changeStatus(id, request.status()));
    }
}