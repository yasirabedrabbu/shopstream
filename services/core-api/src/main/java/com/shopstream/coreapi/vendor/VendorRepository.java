package com.shopstream.coreapi.vendor;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VendorRepository extends JpaRepository<Vendor, UUID> {

    Optional<Vendor> findByOwnerUserId(UUID ownerUserId);

    boolean existsByOwnerUserId(UUID ownerUserId);

    boolean existsBySlug(String slug);

    Optional<Vendor> findBySlugAndStatus(String slug, VendorStatus status);

    Page<Vendor> findByStatus(VendorStatus status, Pageable pageable);
}