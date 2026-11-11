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
                    inventory.release(id);
                    log.info("Order {} expired and stock released", id);
                }
            } catch (RuntimeException ex) {
                log.error("Could not expire order {}. Will retry next run.", id, ex);
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
}