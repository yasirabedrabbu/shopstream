package com.shopstream.coreapi.review;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public record ReviewSummary(
        double average,
        long count,
        Map<Integer, Long> distribution) {

    /** rows are (rating, how many reviews have that rating). Every star level from 1 to 5 is always present. */
    public static ReviewSummary from(List<Object[]> rows) {
        Map<Integer, Long> distribution = new LinkedHashMap<>();
        for (int star = 5; star >= 1; star--) {
            distribution.put(star, 0L);
        }

        long count = 0;
        long weighted = 0;
        for (Object[] row : rows) {
            int star = ((Number) row[0]).intValue();
            long n = ((Number) row[1]).longValue();
            distribution.put(star, n);
            count += n;
            weighted += star * n;
        }

        double average = count == 0 ? 0.0 : Math.round(weighted * 10.0 / count) / 10.0;
        return new ReviewSummary(average, count, distribution);
    }
}