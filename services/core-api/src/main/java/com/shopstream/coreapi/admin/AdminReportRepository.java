package com.shopstream.coreapi.admin;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import com.shopstream.coreapi.admin.PlatformStatsResponse.TopVendor;
import com.shopstream.coreapi.order.OrderStatus;

/**
 * Read-only platform queries in plain SQL. Sales count items of PAID orders that were not cancelled,
 * dated by paid_at, the same rule the vendor dashboard uses.
 */
@Repository
public class AdminReportRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public AdminReportRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public record SalesTotals(long grossCents, long orders, long units) {
    }

    public SalesTotals salesTotals(Instant since) {
        String sql = "SELECT COALESCE(SUM(oi.line_total_cents), 0) AS gross, "
                + "COUNT(DISTINCT o.id) AS order_count, "
                + "COALESCE(SUM(oi.quantity), 0) AS units "
                + "FROM order_items oi JOIN orders o ON o.id = oi.order_id "
                + "WHERE o.status = 'PAID' AND oi.fulfillment_status <> 'CANCELLED' AND o.paid_at >= :since";
        return jdbc.queryForObject(sql, sinceParams(since),
                (rs, i) -> new SalesTotals(rs.getLong("gross"), rs.getLong("order_count"), rs.getLong("units")));
    }

    public List<TopVendor> topVendors(Instant since, int limit) {
        String sql = "SELECT v.id AS vendor_id, v.store_name AS store_name, "
                + "SUM(oi.line_total_cents) AS gross, COUNT(DISTINCT o.id) AS order_count "
                + "FROM order_items oi "
                + "JOIN orders o ON o.id = oi.order_id "
                + "JOIN vendors v ON v.id = oi.vendor_id "
                + "WHERE o.status = 'PAID' AND oi.fulfillment_status <> 'CANCELLED' AND o.paid_at >= :since "
                + "GROUP BY v.id, v.store_name ORDER BY gross DESC LIMIT :limit";
        MapSqlParameterSource p = sinceParams(since).addValue("limit", limit);
        return jdbc.query(sql, p, (rs, i) -> new TopVendor(
                rs.getObject("vendor_id", java.util.UUID.class),
                rs.getString("store_name"),
                rs.getLong("gross"),
                rs.getLong("order_count")));
    }

    public Map<String, Long> usersByRole() {
        return countBy("users", "role");
    }

    public Map<String, Long> vendorsByStatus() {
        return countBy("vendors", "status");
    }

    public Map<String, Long> productsByStatus() {
        return countBy("products", "status");
    }

    public Map<String, Long> ordersByStatus() {
        return countBy("orders", "status");
    }

    public List<AdminOrderRow> orders(OrderStatus status, int limit, long offset) {
        String where = status == null ? "" : "WHERE o.status = :status ";
        String sql = "SELECT o.id AS id, o.status AS status, o.currency AS currency, "
                + "o.total_cents AS total_cents, o.created_at AS created_at, o.paid_at AS paid_at, "
                + "u.email AS customer_email, "
                + "(SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count "
                + "FROM orders o JOIN users u ON u.id = o.customer_id "
                + where
                + "ORDER BY o.created_at DESC, o.id LIMIT :limit OFFSET :offset";
        MapSqlParameterSource p = new MapSqlParameterSource()
                .addValue("limit", limit)
                .addValue("offset", offset);
        if (status != null) {
            p.addValue("status", status.name());
        }
        return jdbc.query(sql, p, (rs, i) -> {
            OffsetDateTime paid = rs.getObject("paid_at", OffsetDateTime.class);
            return new AdminOrderRow(
                    rs.getObject("id", java.util.UUID.class),
                    OrderStatus.valueOf(rs.getString("status")),
                    rs.getString("currency"),
                    rs.getLong("total_cents"),
                    rs.getInt("item_count"),
                    rs.getString("customer_email"),
                    rs.getObject("created_at", OffsetDateTime.class).toInstant(),
                    paid == null ? null : paid.toInstant());
        });
    }

    public long countOrders(OrderStatus status) {
        MapSqlParameterSource p = new MapSqlParameterSource();
        String sql = "SELECT COUNT(*) FROM orders o ";
        if (status != null) {
            sql += "WHERE o.status = :status";
            p.addValue("status", status.name());
        }
        Long total = jdbc.queryForObject(sql, p, Long.class);
        return total == null ? 0 : total;
    }

    /** Table and column come only from the fixed callers above, never from request input. */
    private Map<String, Long> countBy(String table, String column) {
        String sql = "SELECT " + column + " AS k, COUNT(*) AS c FROM " + table + " GROUP BY " + column;
        Map<String, Long> result = new TreeMap<>();
        jdbc.query(sql, new MapSqlParameterSource(), rs -> {
            result.put(rs.getString("k"), rs.getLong("c"));
        });
        return result;
    }

    private static MapSqlParameterSource sinceParams(Instant since) {
        // pgjdbc does not accept java.time.Instant directly, so we bind an OffsetDateTime.
        return new MapSqlParameterSource().addValue("since", OffsetDateTime.ofInstant(since, ZoneOffset.UTC));
    }
}