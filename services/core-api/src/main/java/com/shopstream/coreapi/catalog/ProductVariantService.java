package com.shopstream.coreapi.catalog;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopstream.coreapi.common.ApiException;

/**
 * Every method resolves the product through ProductService.getMine first, so a store owner can only
 * ever touch variants of their own products. Another owner gets 404, same as for products.
 */
@Service
public class ProductVariantService {

    private static final int MAX_VARIANTS_PER_PRODUCT = 100;

    private final ProductVariantRepository variants;
    private final ProductService products;

    public ProductVariantService(ProductVariantRepository variants, ProductService products) {
        this.variants = variants;
        this.products = products;
    }

    @Transactional(readOnly = true)
    public List<VariantResponse> list(UUID ownerId, UUID productId) {
        Product product = products.getMine(ownerId, productId);
        return variants.findByProductIdOrderByCreatedAtAsc(productId).stream()
                .map(v -> VariantResponse.from(v, product.getPriceCents()))
                .toList();
    }

    @Transactional
    public VariantResponse create(UUID ownerId, UUID productId, VariantRequest request) {
        Product product = writable(ownerId, productId);
        String sku = normalizeSku(request.sku());

        if (variants.countByProductId(productId) >= MAX_VARIANTS_PER_PRODUCT) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "A product can have at most " + MAX_VARIANTS_PER_PRODUCT + " variants");
        }
        if (variants.existsByProductIdAndSku(productId, sku)) {
            throw new ApiException(HttpStatus.CONFLICT, "This SKU is already used on this product");
        }
        checkPrice(product, request.priceDeltaCents());

        ProductVariant variant = new ProductVariant(
                productId,
                sku,
                cleanOptions(request.options()),
                request.priceDeltaCents(),
                request.stockQuantity(),
                request.active() == null || request.active());
        return VariantResponse.from(variants.save(variant), product.getPriceCents());
    }

    @Transactional
    public VariantResponse update(UUID ownerId, UUID productId, UUID variantId, VariantRequest request) {
        Product product = writable(ownerId, productId);
        ProductVariant variant = variants.findByIdAndProductId(variantId, productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Variant not found"));

        String sku = normalizeSku(request.sku());
        if (variants.existsByProductIdAndSkuAndIdNot(productId, sku, variantId)) {
            throw new ApiException(HttpStatus.CONFLICT, "This SKU is already used on this product");
        }
        checkPrice(product, request.priceDeltaCents());

        variant.update(
                sku,
                cleanOptions(request.options()),
                request.priceDeltaCents(),
                request.stockQuantity(),
                request.active() == null || request.active());
        return VariantResponse.from(variant, product.getPriceCents());
    }

    @Transactional
    public void delete(UUID ownerId, UUID productId, UUID variantId) {
        writable(ownerId, productId);
        ProductVariant variant = variants.findByIdAndProductId(variantId, productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Variant not found"));
        variants.delete(variant);
    }

    // ---------- helpers ----------

    private Product writable(UUID ownerId, UUID productId) {
        Product product = products.getMine(ownerId, productId);
        if (product.getStatus() == ProductStatus.BLOCKED) {
            throw new ApiException(HttpStatus.FORBIDDEN, "This product was blocked by an admin. Contact support.");
        }
        return product;
    }

    private static void checkPrice(Product product, long deltaCents) {
        if (product.getPriceCents() + deltaCents < 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Variant price cannot be below zero");
        }
    }

    private static String normalizeSku(String sku) {
        return sku.trim().toUpperCase(Locale.ROOT);
    }

    private static Map<String, String> cleanOptions(Map<String, String> options) {
        Map<String, String> cleaned = new LinkedHashMap<>();
        for (Map.Entry<String, String> e : options.entrySet()) {
            String key = e.getKey().trim();
            String lower = key.toLowerCase(Locale.ROOT);
            boolean duplicate = cleaned.keySet().stream().anyMatch(k -> k.toLowerCase(Locale.ROOT).equals(lower));
            if (duplicate) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Option name repeated: " + key);
            }
            cleaned.put(key, e.getValue().trim());
        }
        return cleaned;
    }
}
