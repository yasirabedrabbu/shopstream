package com.shopstream.coreapi.catalog;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.shopstream.coreapi.common.ApiException;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;

/**
 * Imports products from CSV text. This class is deliberately NOT transactional: every row goes through
 * ProductService.create, which has its own transaction, so one bad row never blocks the good ones.
 *
 * Columns (header names, any order, case-insensitive). Required: name, price, stock, category.
 * Optional: description, currency, status, image_urls, seo_title, seo_description, cost_price, tags,
 * slug, publish_at. price and cost_price are in taka with up to 2 decimals (1500.50).
 * category is the category slug. image_urls and tags are separated by a pipe: a|b|c.
 * publish_at is ISO-8601 UTC, for example 2026-12-01T09:00:00Z, and is needed for status SCHEDULED.
 */
@Service
public class ProductImportService {

    public static final int MAX_ROWS = 1000;
    public static final String TEMPLATE =
            "name,description,price,currency,stock,category,status,image_urls,seo_title,seo_description,cost_price,tags,slug,publish_at\n"
                    + "Red Shoe,Comfortable running shoe,1500.00,BDT,25,shoes,DRAFT,"
                    + "https://example.com/a.jpg|https://example.com/b.jpg,Red Shoe,Comfortable running shoe,900.00,sports|shoes,red-shoe,\n";

    private static final List<String> REQUIRED = List.of("name", "price", "stock", "category");
    private static final List<String> KNOWN = List.of("name", "description", "price", "currency", "stock",
            "category", "status", "image_urls", "seo_title", "seo_description", "cost_price", "tags", "slug",
            "publish_at");

    private final ProductService products;
    private final CategoryRepository categories;
    private final Validator validator;

    public ProductImportService(ProductService products, CategoryRepository categories, Validator validator) {
        this.products = products;
        this.categories = categories;
        this.validator = validator;
    }

    public ImportResult importCsv(UUID ownerId, String csv) {
        List<List<String>> rows = CsvParser.parse(csv);
        if (rows.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "The file is empty");
        }

        Map<String, Integer> columns = readHeader(rows.get(0));
        if (rows.size() - 1 > MAX_ROWS) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "At most " + MAX_ROWS + " products per file");
        }

        Map<String, Category> bySlug = new HashMap<>();
        for (Category c : categories.findAll()) {
            bySlug.put(c.getSlug().toLowerCase(Locale.ROOT), c);
        }

        int total = 0;
        int created = 0;
        List<ImportResult.RowError> errors = new ArrayList<>();

        for (int i = 1; i < rows.size(); i++) {
            List<String> row = rows.get(i);
            if (isBlank(row)) {
                continue;
            }
            total++;
            int rowNumber = i + 1;
            try {
                ProductRequest request = toRequest(row, columns, bySlug);
                String problem = validate(request);
                if (problem != null) {
                    errors.add(new ImportResult.RowError(rowNumber, problem));
                    continue;
                }
                products.create(ownerId, request);
                created++;
            } catch (RowException e) {
                errors.add(new ImportResult.RowError(rowNumber, e.getMessage()));
            } catch (ApiException e) {
                errors.add(new ImportResult.RowError(rowNumber, e.getMessage()));
            } catch (RuntimeException e) {
                errors.add(new ImportResult.RowError(rowNumber, "Could not save this row"));
            }
        }
        return new ImportResult(total, created, errors.size(), errors);
    }

    // ---------- parsing ----------

    private static Map<String, Integer> readHeader(List<String> header) {
        Map<String, Integer> columns = new HashMap<>();
        for (int i = 0; i < header.size(); i++) {
            String name = header.get(i).trim().toLowerCase(Locale.ROOT);
            if (name.isEmpty()) {
                continue;
            }
            if (!KNOWN.contains(name)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Unknown column: " + name);
            }
            if (columns.put(name, i) != null) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Column appears twice: " + name);
            }
        }
        for (String required : REQUIRED) {
            if (!columns.containsKey(required)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Missing required column: " + required);
            }
        }
        return columns;
    }

    private ProductRequest toRequest(List<String> row, Map<String, Integer> col, Map<String, Category> bySlug) {
        String name = cell(row, col, "name");
        if (name.isEmpty()) {
            throw new RowException("name is required");
        }

        long priceCents = toCents(cell(row, col, "price"), "price");
        Long costCents = cell(row, col, "cost_price").isEmpty() ? null : toCents(cell(row, col, "cost_price"), "cost_price");

        int stock;
        try {
            stock = Integer.parseInt(cell(row, col, "stock"));
        } catch (NumberFormatException e) {
            throw new RowException("stock must be a whole number");
        }

        String categorySlug = cell(row, col, "category").toLowerCase(Locale.ROOT);
        Category category = bySlug.get(categorySlug);
        if (category == null) {
            throw new RowException("category not found: " + cell(row, col, "category"));
        }

        ProductStatus status = ProductStatus.DRAFT;
        if (!cell(row, col, "status").isEmpty()) {
            try {
                status = ProductStatus.valueOf(cell(row, col, "status").toUpperCase(Locale.ROOT));
            } catch (IllegalArgumentException e) {
                throw new RowException("status must be DRAFT, SCHEDULED, ACTIVE or ARCHIVED");
            }
        }

        Instant publishAt = null;
        if (!cell(row, col, "publish_at").isEmpty()) {
            try {
                publishAt = Instant.parse(cell(row, col, "publish_at"));
            } catch (DateTimeParseException e) {
                throw new RowException("publish_at must look like 2026-12-01T09:00:00Z");
            }
        }

        return new ProductRequest(
                name,
                emptyToNull(cell(row, col, "description")),
                priceCents,
                emptyToNull(cell(row, col, "currency")),
                stock,
                category.getId(),
                split(cell(row, col, "image_urls")),
                status,
                emptyToNull(cell(row, col, "slug")),
                emptyToNull(cell(row, col, "seo_title")),
                emptyToNull(cell(row, col, "seo_description")),
                costCents,
                publishAt,
                split(cell(row, col, "tags")));
    }

    private String validate(ProductRequest request) {
        Set<ConstraintViolation<ProductRequest>> violations = validator.validate(request);
        if (violations.isEmpty()) {
            return null;
        }
        return violations.stream()
                .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                .sorted()
                .collect(Collectors.joining("; "));
    }

    private static long toCents(String text, String field) {
        if (text.isEmpty()) {
            throw new RowException(field + " is required");
        }
        try {
            BigDecimal money = new BigDecimal(text).setScale(2, RoundingMode.UNNECESSARY);
            if (money.signum() < 0) {
                throw new RowException(field + " cannot be negative");
            }
            return money.movePointRight(2).longValueExact();
        } catch (NumberFormatException e) {
            throw new RowException(field + " must be a number like 1500.50");
        } catch (ArithmeticException e) {
            throw new RowException(field + " can have at most 2 decimals");
        }
    }

    private static String cell(List<String> row, Map<String, Integer> col, String name) {
        Integer idx = col.get(name);
        if (idx == null || idx >= row.size()) {
            return "";
        }
        return row.get(idx).trim();
    }

    private static List<String> split(String value) {
        if (value.isEmpty()) {
            return List.of();
        }
        return Arrays.stream(value.split("\\|")).map(String::trim).filter(s -> !s.isEmpty()).toList();
    }

    private static String emptyToNull(String value) {
        return value.isEmpty() ? null : value;
    }

    private static boolean isBlank(List<String> row) {
        return row.stream().allMatch(c -> c.trim().isEmpty());
    }

    /** A problem with one row, shown to the vendor as is. */
    private static final class RowException extends RuntimeException {
        RowException(String message) {
            super(message);
        }
    }
}
