package com.shopstream.coreapi.review;

import java.time.Instant;
import java.util.UUID;

public record ReviewResponse(
        UUID id,
        int rating,
        String comment,
        String reviewerName,
        Instant createdAt,
        Instant updatedAt) {

    public static ReviewResponse from(Review r) {
        return new ReviewResponse(
                r.getId(),
                r.getRating(),
                r.getComment(),
                r.getReviewerName(),
                r.getCreatedAt(),
                r.getUpdatedAt());
    }
}