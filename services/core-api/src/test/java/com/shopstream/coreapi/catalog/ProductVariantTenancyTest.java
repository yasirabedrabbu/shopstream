package com.shopstream.coreapi.catalog;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import com.shopstream.coreapi.common.ApiException;
import com.shopstream.coreapi.vendor.Vendor;

class ProductVariantTenancyTest {

    private final UUID ownerA = UUID.randomUUID();
    private final UUID ownerB = UUID.randomUUID();
    private final UUID productId = UUID.randomUUID();

    private ProductVariantRepository variants;
    private ProductService products;
    private ProductVariantService service;
    private Product productOfA;

    @BeforeEach
    void setUp() {
        variants = mock(ProductVariantRepository.class);
        products = mock(ProductService.class);
        service = new ProductVariantService(variants, products);

        Vendor storeA = new Vendor(ownerA, "Store A", "store-a", null);
        productOfA = new Product(storeA, new Category("Shoes", "shoes"), "Red Shoe", "red-shoe", null,
                150000L, "BDT", 5, ProductStatus.ACTIVE, List.of());

        when(products.getMine(ownerA, productId)).thenReturn(productOfA);
        when(products.getMine(ownerB, productId))
                .thenThrow(new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    private VariantRequest request() {
        return new VariantRequest("sku-1", Map.of("size", "M"), 0L, 3, true);
    }

    @Test
    void otherOwnerCannotListVariants() {
        assertThatThrownBy(() -> service.list(ownerB, productId))
                .isInstanceOf(ApiException.class)
                .hasMessage("Product not found");
        verifyNoInteractions(variants);
    }

    @Test
    void otherOwnerCannotCreateVariant() {
        assertThatThrownBy(() -> service.create(ownerB, productId, request()))
                .isInstanceOf(ApiException.class)
                .hasMessage("Product not found");
        verify(variants, never()).save(any());
    }

    @Test
    void otherOwnerCannotDeleteVariant() {
        assertThatThrownBy(() -> service.delete(ownerB, productId, UUID.randomUUID()))
                .isInstanceOf(ApiException.class)
                .hasMessage("Product not found");
        verify(variants, never()).delete(any());
    }

    @Test
    void ownerCreatesVariantWithUppercaseSkuAndFinalPrice() {
        when(variants.save(any(ProductVariant.class))).thenAnswer(i -> i.getArgument(0));

        VariantResponse created = service.create(ownerA, productId,
                new VariantRequest("sku-1", Map.of("size", "M"), 5000L, 3, null));

        assertThat(created.sku()).isEqualTo("SKU-1");
        assertThat(created.priceCents()).isEqualTo(155000L);
        assertThat(created.active()).isTrue();
    }

    @Test
    void duplicateSkuIsRejected() {
        when(variants.existsByProductIdAndSku(productId, "SKU-1")).thenReturn(true);

        assertThatThrownBy(() -> service.create(ownerA, productId, request()))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("SKU");
    }

    @Test
    void variantPriceCannotGoBelowZero() {
        assertThatThrownBy(() -> service.create(ownerA, productId,
                new VariantRequest("sku-2", Map.of("size", "S"), -999999L, 1, true)))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("below zero");
    }
}
