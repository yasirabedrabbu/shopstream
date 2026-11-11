package com.shopstream.coreapi.catalog;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, UUID> {

    boolean existsBySlug(String slug);

    boolean existsByNameIgnoreCaseAndIdNot(String name, UUID id);

    List<Category> findAllByOrderByNameAsc();
}