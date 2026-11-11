package com.shopstream.coreapi.order;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import com.shopstream.coreapi.inventory.InventoryClient;

@Component
public class OrderMaintenanceJobs {

    private static final Logger log = LoggerFactory.getLogger(OrderMaintenanceJobs.class);
    private static final Duration REFINALIZE_WINDOW = Duration.ofMinutes(30);
    private static final Duration STUCK_PENDING_AFTER = Duration.ofMinutes(5);

    private final OrderRepository orders;
    private final InventoryClient inventory;
    private final TransactionTemplate tx;

    public OrderMaintenanceJobs(OrderRepository orders, InventoryClient inventory, TransactionTemplate tx) {
        this.orders = orders;
        this.inventory = inventory;
        this.tx = tx;
    }

    /** Every minute: orders that were not paid in time become EXPIRED and their stock is released. */
    @Scheduled(fixedDelay = 60_000, initialDelay = 30_000)
    public void expireOverdueOrders() {
        List<UUID> overdueIds = orders
                .findByStatusAndReservationExpiresAtBefore(OrderStatus.AWAITING_PAYMENT, Instant.now())
                .stream()
                .map(Order::getId)
                .toList();

        for (UUID id : overdueIds) {
            try {
                Boolean expired = tx.execute(s -> {
                    // Lock + re-check: a payment may have arrived a moment ago.
                    Order order = orders.findWithLockById(id).orElseThrow();
                    Instant expiresAt = order.getReservationExpiresAt();
                    if (order.getStatus() != OrderStatus.AWAITING_PAYMENT
                            || expiresAt == null
                            || expiresAt.isAfter(Instant.now())) {
                        return false;
                    }
                    order.expire();
                    return true;
                });
                if (Boolean.TRUE.equals(expired)) {
                    releaseQuietly(id);
                    log.info("Order {} expired", id);
                }
            } catch (RuntimeException ex) {
                log.error("Could not expire order {}. Will retry next run.", id, ex);
            }
        }
    }

    /**
     * Every 2 minutes: PENDING orders older than 5 minutes are dead. This happens when the app
     * stopped between saving the order and getting the inventory answer. They get cancelled.
     */
    @Scheduled(fixedDelay = 120_000, initialDelay = 90_000)
    public void cancelStuckPendingOrders() {
        Instant cutoff = Instant.now().minus(STUCK_PENDING_AFTER);
        List<UUID> stuckIds = orders
                .findByStatusAndCreatedAtBefore(OrderStatus.PENDING, cutoff)
                .stream()
                .map(Order::getId)
                .toList();

        for (UUID id : stuckIds) {
            try {
                Boolean cancelled = tx.execute(s -> {
                    // Lock + re-check: the order may have moved on while we were looking.
                    Order order = orders.findWithLockById(id).orElseThrow();
                    if (order.getStatus() != OrderStatus.PENDING) {
                        return false;
                    }
                    order.cancel("Order was not completed");
                    return true;
                });
                if (Boolean.TRUE.equals(cancelled)) {
                    releaseQuietly(id);
                    log.warn("Stuck PENDING order {} cancelled", id);
                }
            } catch (RuntimeException ex) {
                log.error("Could not cancel stuck order {}. Will retry next run.", id, ex);
            }
        }
    }

    /**
     * Every 2 minutes: re-send "finalize" for orders paid in the last 30 minutes.
     * If the first finalize call failed, this repairs it. Safe to repeat, finalize is idempotent.
     */
    @Scheduled(fixedDelay = 120_000, initialDelay = 60_000)
    public void refinalizeRecentPaidOrders() {
        Instant since = Instant.now().minus(REFINALIZE_WINDOW);
        for (Order order : orders.findByStatusAndUpdatedAtAfter(OrderStatus.PAID, since)) {
            try {
                inventory.finalizeReservation(order.getId());
            } catch (RuntimeException ex) {
                log.warn("Re-finalize failed for order {}. Will retry next run.", order.getId(), ex);
            }
        }
    }

    /**
     * The order is already cancelled in our database, so a failed release is not retried.
     * The inventory engine drops the hold by itself when it expires.
     */
    private void releaseQuietly(UUID orderId) {
        try {
            inventory.release(orderId);
        } catch (RuntimeException ex) {
            log.warn("Release failed for order {}. The hold will expire on its own.", orderId, ex);
        }
    }
}