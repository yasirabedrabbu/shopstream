package com.shopstream.coreapi.catalog;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shopstream.coreapi.common.PageResponse;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public PageResponse<PublicProductResponse> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String store,
            @RequestParam(required = false) Long minPrice,
            @RequestParam(required = false) Long maxPrice,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PageRequest pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 100),
                sortFor(sort));

        ProductService.Filter filter = new ProductService.Filter(q, category, store, minPrice, maxPrice);
        return PageResponse.of(productService.search(filter, pageable), PublicProductResponse::from);
    }

    /** Sales that are live right now, the ones ending soonest first. */
    @GetMapping("/flash-sales")
    public PageResponse<PublicProductResponse> flashSales(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PageRequest pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 100),
                Sort.by("saleEndsAt").ascending());

        return PageResponse.of(productService.activeFlashSales(pageable), PublicProductResponse::from);
    }

    @GetMapping("/{slug}")
    public PublicProductResponse bySlug(@PathVariable String slug) {
        return PublicProductResponse.from(productService.getPublicBySlug(slug));
    }

    private static Sort sortFor(String sort) {
        String key = sort == null ? "newest" : sort;
        return switch (key) {
            case "price_asc" -> Sort.by("priceCents").ascending();
            case "price_desc" -> Sort.by("priceCents").descending();
            case "name" -> Sort.by("name").ascending();
            default -> Sort.by("createdAt").descending();
        };
    }
}