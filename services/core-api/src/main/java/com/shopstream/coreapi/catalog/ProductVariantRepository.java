package com.shopstream.coreapi.catalog;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, UUID> {

    List<ProductVariant> findByProductIdOrderByCreatedAtAsc(UUID productId);

    Optional<ProductVariant> findByIdAndProductId(UUID id, UUID productId);

    boolean existsByProductIdAndSku(UUID productId, String sku);

    boolean existsByProductIdAndSkuAndIdNot(UUID productId, String sku, UUID id);

    long countByProductId(UUID productId);
}
