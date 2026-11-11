package com.shopstream.coreapi.inventory;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Java's view of the Rust inventory engine. The engine owns reservations;
 * Postgres stays the source of truth for stock_quantity.
 */
public interface InventoryClient {

    record Line(UUID productId, int quantity) {
    }

    record ReservationResult(boolean success, Instant expiresAt, List<UUID> unavailableProductIds) {

        public static ReservationResult ok(Instant expiresAt) {
            return new ReservationResult(true, expiresAt, List.of());
        }

        public static ReservationResult soldOut(List<UUID> unavailableProductIds) {
            return new ReservationResult(false, null, List.copyOf(unavailableProductIds));
        }
    }

    /** All-or-nothing hold of every line for the given duration. Idempotent per orderId. */
    ReservationResult reserve(UUID orderId, List<Line> lines, Duration hold);

    /** Give the held stock back (payment failed, order cancelled). Idempotent. */
    void release(UUID orderId);

    /** Convert the hold into a permanent sale (payment confirmed). Idempotent. */
    void finalizeReservation(UUID orderId);
}