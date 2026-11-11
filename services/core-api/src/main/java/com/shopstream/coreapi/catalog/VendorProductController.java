package com.shopstream.coreapi.catalog;

import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.shopstream.coreapi.common.PageResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/vendor/products")
public class VendorProductController {

    private final ProductService productService;

    public VendorProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ProductRequest request) {
        return ProductResponse.from(productService.create(userId(jwt), request));
    }

    @GetMapping
    public PageResponse<ProductResponse> list(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) ProductStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 100),
                Sort.by("createdAt").descending());
        return PageResponse.of(productService.listMine(userId(jwt), status, pageable), ProductResponse::from);
    }

    @GetMapping("/{id}")
    public ProductResponse get(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return ProductResponse.from(productService.getMine(userId(jwt), id));
    }

    @PutMapping("/{id}")
    public ProductResponse update(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
            @Valid @RequestBody ProductRequest request) {
        return ProductResponse.from(productService.update(userId(jwt), id, request));
    }

    @DeleteMapping("/{id}")
    public ProductResponse archive(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return ProductResponse.from(productService.archive(userId(jwt), id));
    }

    @PutMapping("/{id}/flash-sale")
    public ProductResponse setFlashSale(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
            @Valid @RequestBody FlashSaleRequest request) {
        return ProductResponse.from(productService.setFlashSale(userId(jwt), id, request));
    }

    @DeleteMapping("/{id}/flash-sale")
    public ProductResponse clearFlashSale(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return ProductResponse.from(productService.clearFlashSale(userId(jwt), id));
    }

    private static UUID userId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }
}