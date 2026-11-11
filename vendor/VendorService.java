package com.shopstream.coreapi.vendor;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopstream.coreapi.common.ApiException;
import com.shopstream.coreapi.common.Slugs;
import com.shopstream.coreapi.user.Role;
import com.shopstream.coreapi.user.User;
import com.shopstream.coreapi.user.UserRepository;

@Service
public class VendorService {

    private final VendorRepository vendors;
    private final UserRepository users;

    public VendorService(VendorRepository vendors, UserRepository users) {
        this.vendors = vendors;
        this.users = users;
    }

    @Transactional
    public Vendor create(UUID ownerId, VendorRequest request) {
        User owner = users.findById(ownerId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (owner.getRole() != Role.VENDOR) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only vendor accounts can create a store");
        }
        if (vendors.existsByOwnerUserId(ownerId)) {
            throw new ApiException(HttpStatus.CONFLICT, "Store already exists for this account");
        }

        String name = request.storeName().trim();
        Vendor vendor = new Vendor(ownerId, name, uniqueSlug(name), cleanDescription(request.description()));
        return vendors.save(vendor);
    }

    @Transactional(readOnly = true)
    public Vendor getMine(UUID ownerId) {
        return vendors.findByOwnerUserId(ownerId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "You have no store yet"));
    }

    @Transactional
    public Vendor updateMine(UUID ownerId, VendorRequest request) {
        Vendor vendor = getMine(ownerId);
        vendor.update(request.storeName().trim(), cleanDescription(request.description()));
        return vendor;
    }

    @Transactional(readOnly = true)
    public Vendor getPublicBySlug(String slug) {
        return vendors.findBySlugAndStatus(slug, VendorStatus.APPROVED)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Store not found"));
    }

    @Transactional(readOnly = true)
    public Page<Vendor> list(VendorStatus status, Pageable pageable) {
        return status == null ? vendors.findAll(pageable) : vendors.findByStatus(status, pageable);
    }

    @Transactional
    public Vendor changeStatus(UUID vendorId, VendorStatus status) {
        Vendor vendor = vendors.findById(vendorId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Vendor not found"));
        vendor.setStatus(status);
        return vendor;
    }

    private String uniqueSlug(String name) {
        String base = Slugs.slugify(name);
        String candidate = base;
        int suffix = 2;
        while (vendors.existsBySlug(candidate)) {
            candidate = base + "-" + suffix++;
        }
        return candidate;
    }

    private static String cleanDescription(String description) {
        if (description == null || description.isBlank()) {
            return null;
        }
        return description.trim();
    }
}