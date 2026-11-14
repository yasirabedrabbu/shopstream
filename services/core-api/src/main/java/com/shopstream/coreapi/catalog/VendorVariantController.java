package com.shopstream.coreapi.catalog;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/vendor/products/{productId}/variants")
public class VendorVariantController {

    private final ProductVariantService service;

    public VendorVariantController(ProductVariantService service) {
        this.service = service;
    }

    @GetMapping
    public List<VariantResponse> list(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID productId) {
        return service.list(userId(jwt), productId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VariantResponse create(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID productId,
            @Valid @RequestBody VariantRequest request) {
        return service.create(userId(jwt), productId, request);
    }

    @PutMapping("/{variantId}")
    public VariantResponse update(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID productId,
            @PathVariable UUID variantId, @Valid @RequestBody VariantRequest request) {
        return service.update(userId(jwt), productId, variantId, request);
    }

    @DeleteMapping("/{variantId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID productId,
            @PathVariable UUID variantId) {
        service.delete(userId(jwt), productId, variantId);
    }

    private static UUID userId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }
}
