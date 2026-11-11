package com.shopstream.coreapi.vendor;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/vendor/store")
public class VendorController {

    private final VendorService vendorService;

    public VendorController(VendorService vendorService) {
        this.vendorService = vendorService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VendorResponse create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody VendorRequest request) {
        return VendorResponse.from(vendorService.create(userId(jwt), request));
    }

    @GetMapping
    public VendorResponse mine(@AuthenticationPrincipal Jwt jwt) {
        return VendorResponse.from(vendorService.getMine(userId(jwt)));
    }

    @PutMapping
    public VendorResponse update(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody VendorRequest request) {
        return VendorResponse.from(vendorService.updateMine(userId(jwt), request));
    }

    private static UUID userId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }
}