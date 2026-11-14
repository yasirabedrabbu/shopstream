package com.shopstream.coreapi.catalog;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.shopstream.coreapi.vendor.VendorStatus;

public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {

    boolean existsBySlug(String slug);

    boolean existsByCategoryId(UUID categoryId);

    Optional<Product> findBySlugAndStatusAndVendorStatus(String slug, ProductStatus status,
            VendorStatus vendorStatus);

    Page<Product> findByVendorId(UUID vendorId, Pageable pageable);

    Page<Product> findByVendorIdAndStatus(UUID vendorId, ProductStatus status, Pageable pageable);

    /** Atomic in the database. Returns 0 when there is not enough stock, so stock can never go negative. */
    @Modifying
    @Query(value = "UPDATE products SET stock_quantity = stock_quantity - :qty, updated_at = now() "
            + "WHERE id = :id AND stock_quantity >= :qty", nativeQuery = true)
    int decrementStock(@Param("id") UUID id, @Param("qty") int qty);

    /** Gives stock back (for example after a refund). Atomic in the database. Returns 0 if the product is gone. */
    @Modifying
    @Query(value = "UPDATE products SET stock_quantity = stock_quantity + :qty, updated_at = now() "
            + "WHERE id = :id", nativeQuery = true)
    int incrementStock(@Param("id") UUID id, @Param("qty") int qty);

    /** Publishes scheduled products whose time has come. Only approved stores go live. Returns rows changed. */
    @Modifying
    @Query(value = "UPDATE products SET status = 'ACTIVE', updated_at = now() "
            + "WHERE status = 'SCHEDULED' AND publish_at <= now() "
            + "AND vendor_id IN (SELECT id FROM vendors WHERE status = 'APPROVED')", nativeQuery = true)
    int activateDueScheduled();
}
