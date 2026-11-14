package com.shopstream.coreapi.catalog;

import java.util.List;

/** row is the record number in the file. The header is row 1, so the first product is row 2. */
public record ImportResult(int total, int created, int failed, List<RowError> errors) {

    public record RowError(int row, String message) {
    }
}
