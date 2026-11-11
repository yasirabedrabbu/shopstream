package com.shopstream.coreapi.inventory;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/** Dev-only fake. Always succeeds, never tracks stock. Replaced by the real client once the Rust engine exists. */
@Component
@ConditionalOnProperty(name = "app.inventory.mode", havingValue = "stub", matchIfMissing = true)
public class StubInventoryClient implements InventoryClient {

    private static final Logger log = LoggerFactory.getLogger(StubInventoryClient.class);

    public StubInventoryClient() {
        log.warn("Using StubInventoryClient. Stock is NOT enforced. Do not use in production.");
    }

    @Override
    public ReservationResult reserve(UUID orderId, List<Line> lines, Duration hold) {
        return ReservationResult.ok(Instant.now().plus(hold));
    }

    @Override
    public void release(UUID orderId) {
        log.info("[stub] release {}", orderId);
    }

    @Override
    public void finalizeReservation(UUID orderId) {
        log.info("[stub] finalize {}", orderId);
    }
}