// services/core-api/src/test/java/com/shopstream/coreapi/catalog/ProductTenancyTest.java
package com.shopstream.coreapi.catalog;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import com.shopstream.coreapi.common.ApiException;
import com.shopstream.coreapi.vendor.Vendor;
import com.shopstream.coreapi.vendor.VendorRepository;

/**
 * Proves that one store owner cannot read or change another store's products.
 * Store A belongs to ownerA. ownerB is a different store owner.
 */
class ProductTenancyTest {

    private ProductRepository products;
    private CategoryRepository categories;
    private VendorRepository vendors;
    private ProductService service;

    private final UUID ownerA = UUID.randomUUID();
    private final UUID ownerB = UUID.randomUUID();

    private Product productOfStoreA;

    @BeforeEach
    void setUp() {
        products = mock(ProductRepository.class);
        categories = mock(CategoryRepository.class);
        vendors = mock(VendorRepository.class);
        service = new ProductService(products, categories, vendors);

        Vendor storeA = new Vendor(ownerA, "Store A", "store-a", null);
        Category shoes = new Category("Shoes", "shoes");
        productOfStoreA = new Product(
                storeA, shoes, "Red Shoe", "red-shoe", null,
                150000L, "BDT", 5, ProductStatus.ACTIVE, List.of());

        when(products.findById(any(UUID.class))).thenReturn(Optional.of(productOfStoreA));
    }

    @Test
    void ownerCanReadOwnProduct() {
        Product found = service.getMine(ownerA, UUID.randomUUID());

        assertThat(found).isSameAs(productOfStoreA);
    }

    @Test
    void otherOwnerCannotReadProduct() {
        assertThatThrownBy(() -> service.getMine(ownerB, UUID.randomUUID()))
                .isInstanceOf(ApiException.class)
                .satisfies(ex -> assertThat(((ApiException) ex).getStatus()).isEqualTo(HttpStatus.NOT_FOUND))
                .hasMessage("Product not found");
    }

    @Test
    void otherOwnerCannotArchiveProduct() {
        assertThatThrownBy(() -> service.archive(ownerB, UUID.randomUUID()))
                .isInstanceOf(ApiException.class)
                .hasMessage("Product not found");

        assertThat(productOfStoreA.getStatus()).isEqualTo(ProductStatus.ACTIVE);
    }

    @Test
    void otherOwnerCannotSetFlashSale() {
        FlashSaleRequest request = new FlashSaleRequest(
                100000L,
                java.time.Instant.now().plusSeconds(60),
                java.time.Instant.now().plusSeconds(3600));

        assertThatThrownBy(() -> service.setFlashSale(ownerB, UUID.randomUUID(), request))
                .isInstanceOf(ApiException.class)
                .hasMessage("Product not found");

        assertThat(productOfStoreA.getSalePriceCents()).isNull();
        verify(products, never()).save(any());
    }
}