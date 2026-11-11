package com.shopstream.coreapi.review;

import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.shopstream.coreapi.common.PageResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/products/{slug}/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public PageResponse<ReviewResponse> list(
            @PathVariable String slug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageRequest pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 50),
                Sort.by("createdAt").descending());
        return reviewService.list(slug, pageable);
    }

    @GetMapping("/summary")
    public ReviewSummary summary(@PathVariable String slug) {
        return reviewService.summary(slug);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponse create(@AuthenticationPrincipal Jwt jwt, @PathVariable String slug,
            @Valid @RequestBody ReviewRequest request) {
        return reviewService.create(userId(jwt), slug, request);
    }

    @PutMapping("/mine")
    public ReviewResponse update(@AuthenticationPrincipal Jwt jwt, @PathVariable String slug,
            @Valid @RequestBody ReviewRequest request) {
        return reviewService.updateMine(userId(jwt), slug, request);
    }

    @DeleteMapping("/mine")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable String slug) {
        reviewService.deleteMine(userId(jwt), slug);
    }

    private static UUID userId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }
}