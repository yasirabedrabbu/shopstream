package com.shopstream.coreapi.catalog;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.shopstream.coreapi.common.ApiException;

@RestController
@RequestMapping("/api/v1/vendor/products/import")
public class VendorProductImportController {

    private final ProductImportService importService;

    public VendorProductImportController(ProductImportService importService) {
        this.importService = importService;
    }

    /** POST multipart form field "file" (CSV, UTF-8). Spring's default upload limit is 1 MB. */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ImportResult upload(@AuthenticationPrincipal Jwt jwt, @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Choose a CSV file");
        }
        try {
            String csv = new String(file.getBytes(), StandardCharsets.UTF_8);
            return importService.importCsv(UUID.fromString(jwt.getSubject()), csv);
        } catch (IOException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Could not read the file");
        }
    }

    @GetMapping("/template")
    public ResponseEntity<String> template() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"product-import-template.csv\"")
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                .body(ProductImportService.TEMPLATE);
    }
}
