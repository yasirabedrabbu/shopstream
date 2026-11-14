package com.shopstream.coreapi.catalog;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import com.shopstream.coreapi.common.ApiException;

import jakarta.validation.Validation;

class ProductImportServiceTest {

    private final UUID owner = UUID.randomUUID();
    private final UUID shoesId = UUID.randomUUID();

    private ProductService products;
    private ProductImportService service;

    @BeforeEach
    void setUp() {
        products = mock(ProductService.class);
        CategoryRepository categories = mock(CategoryRepository.class);

        Category shoes = mock(Category.class);
        when(shoes.getSlug()).thenReturn("shoes");
        when(shoes.getId()).thenReturn(shoesId);
        when(categories.findAll()).thenReturn(List.of(shoes));

        service = new ProductImportService(products, categories,
                Validation.buildDefaultValidatorFactory().getValidator());
    }

    @Test
    void goodRowsAreCreatedAndBadRowsReportTheirRowNumber() {
        String csv = "name,price,stock,category\n"
                + "Good Shoe,1500.50,10,shoes\n"
                + "Bad Price,abc,5,shoes\n"
                + "No Category,100,5,ghost\n";

        ImportResult result = service.importCsv(owner, csv);

        assertThat(result.total()).isEqualTo(3);
        assertThat(result.created()).isEqualTo(1);
        assertThat(result.failed()).isEqualTo(2);
        assertThat(result.errors()).extracting(ImportResult.RowError::row).containsExactly(3, 4);

        ArgumentCaptor<ProductRequest> captor = ArgumentCaptor.forClass(ProductRequest.class);
        verify(products, times(1)).create(eq(owner), captor.capture());
        assertThat(captor.getValue().priceCents()).isEqualTo(150050L);
        assertThat(captor.getValue().categoryId()).isEqualTo(shoesId);
        assertThat(captor.getValue().status()).isEqualTo(ProductStatus.DRAFT);
    }

    @Test
    void moreThanTwoDecimalsIsRejected() {
        ImportResult result = service.importCsv(owner, "name,price,stock,category\nShoe,10.999,1,shoes\n");

        assertThat(result.created()).isZero();
        assertThat(result.errors().get(0).message()).contains("2 decimals");
    }

    @Test
    void serviceErrorOnOneRowDoesNotStopTheNext() {
        when(products.create(eq(owner), any(ProductRequest.class)))
                .thenThrow(new ApiException(org.springframework.http.HttpStatus.CONFLICT, "Slug taken"))
                .thenReturn(null);

        ImportResult result = service.importCsv(owner,
                "name,price,stock,category\nA,1,1,shoes\nB,2,2,shoes\n");

        assertThat(result.created()).isEqualTo(1);
        assertThat(result.errors()).hasSize(1);
        assertThat(result.errors().get(0).row()).isEqualTo(2);
        assertThat(result.errors().get(0).message()).isEqualTo("Slug taken");
    }

    @Test
    void missingRequiredColumnFailsTheWholeFile() {
        assertThatThrownBy(() -> service.importCsv(owner, "name,price\nShoe,10\n"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Missing required column");
    }

    @Test
    void unknownColumnFailsTheWholeFile() {
        assertThatThrownBy(() -> service.importCsv(owner, "name,price,stock,category,colour\nA,1,1,shoes,red\n"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Unknown column");
    }

    @Test
    void blankLinesAreSkippedNotCounted() {
        ImportResult result = service.importCsv(owner, "name,price,stock,category\n\nA,1,1,shoes\n\n");

        assertThat(result.total()).isEqualTo(1);
        assertThat(result.created()).isEqualTo(1);
    }

    @Test
    void fileWithOverTheLimitIsRejected() {
        StringBuilder csv = new StringBuilder("name,price,stock,category\n");
        for (int i = 0; i <= ProductImportService.MAX_ROWS; i++) {
            csv.append("P").append(i).append(",1,1,shoes\n");
        }

        assertThatThrownBy(() -> service.importCsv(owner, csv.toString()))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("At most");
    }
}
