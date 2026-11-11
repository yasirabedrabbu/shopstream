package com.shopstream.coreapi.vendor;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/stores")
public class StoreController {

    private final VendorService vendorService;

    public StoreController(VendorService vendorService) {
        this.vendorService = vendorService;
    }

    @GetMapping("/{slug}")
    public PublicStoreResponse bySlug(@PathVariable String slug) {
        return PublicStoreResponse.from(vendorService.getPublicBySlug(slug));
    }
}