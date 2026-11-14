package com.shopstream.coreapi.catalog;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.shopstream.coreapi.common.ApiException;
import com.shopstream.coreapi.vendor.Vendor;
import com.shopstream.coreapi.vendor.VendorRepository;

class ProductSchedulingRulesTest {

    private final UUID owner = UUID.randomUUID();
    private final UUID categoryId = UUID.randomUUID();

    private ProductRepository products;
    private ProductService service;

    @BeforeEach
    void setUp() {
        products = mock(ProductRepository.class);
        CategoryRepository categories = mock(CategoryRepository.class);
        VendorRepository vendors = mock(VendorRepository.class);
        service = new ProductService(products, categories, vendors);

        when(vendors.findByOwnerUserId(owner))
                .thenReturn(Optional.of(new Vendor(owner, "Store", "store", null)));
        when(categories.findById(categoryId)).thenReturn(Optional.of(new Category("Shoes", "shoes")));
        when(products.existsBySlug(any())).thenReturn(false);
        when(products.save(any(Product.class))).thenAnswer(i -> i.getArgument(0));
    }

    private ProductRequest request(ProductStatus status, Instant publishAt, String currency) {
        return new ProductRequest("Red Shoe", null, 150000L, currency, 5, categoryId, List.of(),
                status, null, null, null, null, publishAt, List.of("Sports", " sports ", "Shoes"));
    }

    @Test
    void scheduledNeedsPublishAt() {
        assertThatThrownBy(() -> service.create(owner, request(ProductStatus.SCHEDULED, null, null)))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("publishAt is required");
    }

    @Test
    void scheduledNeedsFutureTime() {
        assertThatThrownBy(() -> service.create(owner,
                request(ProductStatus.SCHEDULED, Instant.now().minusSeconds(60), null)))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("future");
    }

    @Test
    void scheduledProductKeepsItsTimeAndDraftDoesNot() {
        Instant when = Instant.now().plusSeconds(3600);

        Product scheduled = service.create(owner, request(ProductStatus.SCHEDULED, when, null));
        Product draft = service.create(owner, request(ProductStatus.DRAFT, when, null));

        assertThat(scheduled.getPublishAt()).isEqualTo(when);
        assertThat(draft.getPublishAt()).isNull();
    }

    @Test
    void currencyDefaultsToBdtAndTagsAreCleaned() {
        Product product = service.create(owner, request(ProductStatus.DRAFT, null, null));

        assertThat(product.getCurrency()).isEqualTo("BDT");
        assertThat(product.getTags()).containsExactlyInAnyOrder("sports", "shoes");
    }
}
