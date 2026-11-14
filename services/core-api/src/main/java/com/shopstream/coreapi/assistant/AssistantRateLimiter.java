package com.shopstream.coreapi.assistant;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import com.shopstream.coreapi.common.ApiException;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;

/** 20 assistant messages per minute per client IP. In-memory, same approach as LoginRateLimitFilter. */
@Component
public class AssistantRateLimiter {

    private static final int CAPACITY = 20;
    private static final Duration REFILL_PERIOD = Duration.ofMinutes(1);

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public void check(String clientIp) {
        Bucket bucket = buckets.computeIfAbsent(clientIp, k -> newBucket());
        if (!bucket.tryConsume(1)) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,
                    "Too many messages. Please wait a minute and try again.");
        }
    }

    private static Bucket newBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(CAPACITY)
                        .refillGreedy(CAPACITY, REFILL_PERIOD)
                        .build())
                .build();
    }
}