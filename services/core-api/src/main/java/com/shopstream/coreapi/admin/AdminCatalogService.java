package com.shopstream.coreapi.admin;

import java.util.Locale;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopstream.coreapi.catalog.Category;
import com.shopstream.coreapi.catalog.CategoryRepository;
import com.shopstream.coreapi.catalog.CategoryRequest;
import com.shopstream.coreapi.catalog.Product;
import com.shopstream.coreapi.catalog.ProductRepository;
import com.shopstream.coreapi.catalog.ProductStatus;
import com.shopstream.coreapi.common.ApiException;

@Service
public class AdminCatalogService {

    private final CategoryRepository categories;
    private final ProductRepository products;

    public AdminCatalogService(CategoryRepository categories, ProductRepository products) {
        this.categories = categories;
        this.products = products;
    }

    // ---------- categories ----------

    @Transactional
    public Category updateCategory(UUID id, CategoryRequest request) {
        Category category = categories.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Category not found"));
        String name = request.name().trim();
        if (categories.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new ApiException(HttpStatus.CONFLICT, "Another category already has this name");
        }
        category.rename(name);
        return category;
    }

    @Transactional
    public void deleteCategory(UUID id) {
        Category category = categories.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Category not found"));
        if (products.existsByCategoryId(id)) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "This category still has products. Move them to another category first.");
        }
        categories.delete(category);
    }

    // ---------- product moderation ----------

    @Transactional(readOnly = true)
    public Page<AdminProductResponse> listProducts(ProductStatus status, String search, Pageable pageable) {
        Specification<Product> spec = (root, query, cb) -> cb.conjunction();
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (search != null && !search.isBlank()) {
            String like = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("name")), like));
        }
        return products.findAll(spec, pageable).map(AdminProductResponse::from);
    }

    @Transactional
    public AdminProductResponse block(UUID id) {
        Product product = findProduct(id);
        if (product.getStatus() == ProductStatus.BLOCKED) {
            throw new ApiException(HttpStatus.CONFLICT, "Product is already blocked");
        }
        product.setStatus(ProductStatus.BLOCKED);
        return AdminProductResponse.from(product);
    }

    /** Unblocking puts the product back as DRAFT, so the vendor has to publish it again. */
    @Transactional
    public AdminProductResponse unblock(UUID id) {
        Product product = findProduct(id);
        if (product.getStatus() != ProductStatus.BLOCKED) {
            throw new ApiException(HttpStatus.CONFLICT, "Product is not blocked");
        }
        product.setStatus(ProductStatus.DRAFT);
        return AdminProductResponse.from(product);
    }

    private Product findProduct(UUID id) {
        return products.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
    }
}