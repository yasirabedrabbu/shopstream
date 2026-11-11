package com.shopstream.coreapi.catalog;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.shopstream.coreapi.vendor.VendorStatus;

public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {

    boolean existsBySlug(String slug);

    Optional<Product> findBySlugAndStatusAndVendorStatus(String slug, ProductStatus status,
            VendorStatus vendorStatus);

    Page<Product> findByVendorId(UUID vendorId, Pageable pageable);

    Page<Product> findByVendorIdAndStatus(UUID vendorId, ProductStatus status, Pageable pageable);
}