package com.shopstream.coreapi.notification;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import com.shopstream.coreapi.common.Money;
import com.shopstream.coreapi.order.Order;
import com.shopstream.coreapi.order.OrderItem;
import com.shopstream.coreapi.order.OrderRepository;
import com.shopstream.coreapi.order.OrderStatus;
import com.shopstream.coreapi.vendor.Vendor;
import com.shopstream.coreapi.vendor.VendorRepository;

@Component
public class OrderPaidNotifier {

    private static final Logger log = LoggerFactory.getLogger(OrderPaidNotifier.class);

    private record VendorShare(UUID vendorId, UUID ownerUserId, long cents, long units) {
    }

    private record Snapshot(UUID orderId, UUID customerId, String currency, long totalCents,
            List<VendorShare> shares) {
    }

    private final JdbcTemplate jdbc;
    private final OrderRepository orders;
    private final VendorRepository vendors;
    private final NotificationService notifications;
    private final TransactionTemplate tx;

    public OrderPaidNotifier(JdbcTemplate jdbc, OrderRepository orders, VendorRepository vendors,
            NotificationService notifications, TransactionTemplate tx) {
        this.jdbc = jdbc;
        this.orders = orders;
        this.vendors = vendors;
        this.notifications = notifications;
        this.tx = tx;
    }

    @Scheduled(fixedDelay = 30_000, initialDelay = 45_000)
    public void notifyPaidOrders() {
        List<UUID> orderIds = jdbc.queryForList(
                "SELECT o.id FROM orders o "
                        + "WHERE o.status = 'PAID' "
                        + "AND NOT EXISTS (SELECT 1 FROM notifications n "
                        + "                WHERE n.dedupe_key = 'ORDER_PAID:' || o.id::text) "
                        + "ORDER BY o.created_at LIMIT 50",
                UUID.class);

        for (UUID orderId : orderIds) {
            try {
                Snapshot snap = tx.execute(s -> snapshot(orderId));
                if (snap != null) {
                    notifyAll(snap);
                }
            } catch (RuntimeException ex) {
                log.error("Could not send notifications for order {}. Will retry.", orderId, ex);
            }
        }
    }

    private void notifyAll(Snapshot snap) {
        String shortId = snap.orderId().toString().substring(0, 8).toUpperCase();

        // Vendors first. The customer notification is the "done" marker, so a crash in between retries safely.
        for (VendorShare share : snap.shares()) {
            notifications.notifyUserOnce(
                    "NEW_ORDER:" + snap.orderId() + ":" + share.vendorId(),
                    share.ownerUserId(),
                    NotificationType.NEW_ORDER,
                    "New order #" + shortId,
                    "You have a new order worth " + Money.format(snap.currency(), share.cents())
                            + " (" + share.units() + " items). Pack it and mark it as shipped.",
                    "/vendor/orders");
        }

        notifications.notifyUserOnce(
                "ORDER_PAID:" + snap.orderId(),
                snap.customerId(),
                NotificationType.ORDER_PAID,
                "Payment received",
                "Your order #" + shortId + " (" + Money.format(snap.currency(), snap.totalCents())
                        + ") is confirmed. We will tell you when it ships.",
                "/orders/" + snap.orderId());
    }

    private Snapshot snapshot(UUID orderId) {
        Order order = orders.findById(orderId).orElse(null);
        if (order == null || order.getStatus() != OrderStatus.PAID) {
            return null;
        }

        Map<UUID, long[]> perVendor = new LinkedHashMap<>();
        for (OrderItem item : order.getItems()) {
            long[] agg = perVendor.computeIfAbsent(item.getVendorId(), k -> new long[2]);
            agg[0] += item.getLineTotalCents();
            agg[1] += item.getQuantity();
        }

        List<VendorShare> shares = new ArrayList<>();
        for (Vendor vendor : vendors.findAllById(perVendor.keySet())) {
            long[] agg = perVendor.get(vendor.getId());
            shares.add(new VendorShare(vendor.getId(), vendor.getOwnerUserId(), agg[0], agg[1]));
        }
        return new Snapshot(order.getId(), order.getCustomerId(), order.getCurrency(),
                order.getTotalCents(), shares);
    }
}