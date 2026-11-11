package com.shopstream.coreapi.admin;

import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
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

import com.shopstream.coreapi.catalog.CategoryRequest;
import com.shopstream.coreapi.catalog.CategoryResponse;
import com.shopstream.coreapi.catalog.ProductStatus;
import com.shopstream.coreapi.common.PageResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminCatalogController {

    private final AdminCatalogService service;

    public AdminCatalogController(AdminCatalogService service) {
        this.service = service;
    }

    /** PUT /api/v1/admin/categories/{id}  body: {"name":"New name"} */
    @PutMapping("/categories/{id}")
    public CategoryResponse updateCategory(@PathVariable UUID id, @Valid @RequestBody CategoryRequest request) {
        return CategoryResponse.from(service.updateCategory(id, request));
    }

    @DeleteMapping("/categories/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable UUID id) {
        service.deleteCategory(id);
    }

    /** GET /api/v1/admin/products?status=ACTIVE&q=shoe&page=0&size=20 */
    @GetMapping("/products")
    public PageResponse<AdminProductResponse> listProducts(
            @RequestParam(required = false) ProductStatus status,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 100),
                Sort.by("createdAt").descending());
        var result = service.listProducts(status, q, pageable);
        return PageResponse.of(result, p -> p);
    }

    @PostMapping("/products/{id}/block")
    public AdminProductResponse block(@PathVariable UUID id) {
        return service.block(id);
    }

    @PostMapping("/products/{id}/unblock")
    public AdminProductResponse unblock(@PathVariable UUID id) {
        return service.unblock(id);
    }
}