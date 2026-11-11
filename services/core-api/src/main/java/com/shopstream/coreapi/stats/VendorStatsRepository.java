package com.shopstream.coreapi.stats;

import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import com.shopstream.coreapi.order.FulfillmentStatus;
import com.shopstream.coreapi.stats.VendorDashboardResponse.DailyPoint;
import com.shopstream.coreapi.stats.VendorDashboardResponse.LowStock;
import com.shopstream.coreapi.stats.VendorDashboardResponse.RecentItem;
import com.shopstream.coreapi.stats.VendorDashboardResponse.TopProduct;

/**
 * Read-only stats queries in plain SQL. Revenue counts items of PAID orders that were not cancelled.
 */
@Repository
public class VendorStatsRepository {

    private static final String FROM_ITEMS = "FROM order_items oi JOIN orders o ON o.id = oi.order_id ";

    private static final String PAID_FILTER = "WHERE oi.vendor_id = :vendorId AND o.status = 'PAID' "
            + "AND oi.fulfillment_status <> 'CANCELLED' AND o.paid_at >= :since ";

    private final NamedParameterJdbcTemplate jdbc;

    public VendorStatsRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public record Totals(long grossCents, long orders, long units) {
    }

    public Totals totals(UUID vendorId, Instant since) {
        String sql = "SELECT COALESCE(SUM(oi.line_total_cents), 0) AS gross, "
                + "COUNT(DISTINCT o.id) AS order_count, "
                + "COALESCE(SUM(oi.quantity), 0) AS units "
                + FROM_ITEMS + PAID_FILTER;
        return jdbc.queryForObject(sql, params(vendorId, since),
                (rs, i) -> new Totals(rs.getLong("gross"), rs.getLong("order_count"), rs.getLong("units")));
    }

    public Map<FulfillmentStatus, Long> pipeline(UUID vendorId) {
        String sql = "SELECT oi.fulfillment_status AS status, COUNT(*) AS cnt "
                + FROM_ITEMS
                + "WHERE oi.vendor_id = :vendorId AND o.status = 'PAID' "
                + "GROUP BY oi.fulfillment_status";
        Map<FulfillmentStatus, Long> result = new EnumMap<>(FulfillmentStatus.class);
        for (FulfillmentStatus s : FulfillmentStatus.values()) {
            result.put(s, 0L);
        }
        jdbc.query(sql, new MapSqlParameterSource().addValue("vendorId", vendorId), rs -> {
            result.put(FulfillmentStatus.valueOf(rs.getString("status")), rs.getLong("cnt"));
        });
        return result;
    }

    public List<LowStock> lowStock(UUID vendorId, int threshold) {
        String sql = "SELECT id, name, slug, stock_quantity FROM products "
                + "WHERE vendor_id = :vendorId AND status = 'ACTIVE' AND stock_quantity <= :threshold "
                + "ORDER BY stock_quantity ASC, name ASC LIMIT 20";
        MapSqlParameterSource p = new MapSqlParameterSource()
                .addValue("vendorId", vendorId)
                .addValue("threshold", threshold);
        return jdbc.query(sql, p, (rs, i) -> new LowStock(
                rs.getObject("id", UUID.class),
                rs.getString("name"),
                rs.getString("slug"),
                rs.getInt("stock_quantity")));
    }

    public List<TopProduct> topProducts(UUID vendorId, Instant since, int limit) {
        String sql = "SELECT oi.product_id AS product_id, MAX(oi.product_name) AS name, "
                + "SUM(oi.quantity) AS units, SUM(oi.line_total_cents) AS revenue "
                + FROM_ITEMS + PAID_FILTER
                + "GROUP BY oi.product_id ORDER BY revenue DESC, units DESC LIMIT :limit";
        MapSqlParameterSource p = params(vendorId, since).addValue("limit", limit);
        return jdbc.query(sql, p, (rs, i) -> new TopProduct(
                rs.getObject("product_id", UUID.class),
                rs.getString("name"),
                rs.getLong("units"),
                rs.getLong("revenue")));
    }

    /** Daily buckets in UTC. Days with no sales are missing here, the service fills them with zero. */
    public Map<LocalDate, DailyPoint> daily(UUID vendorId, Instant since) {
        String sql = "SELECT CAST(o.paid_at AT TIME ZONE 'UTC' AS date) AS day, "
                + "COALESCE(SUM(oi.line_total_cents), 0) AS gross, "
                + "COUNT(DISTINCT o.id) AS order_count "
                + FROM_ITEMS + PAID_FILTER
                + "GROUP BY 1 ORDER BY 1";
        Map<LocalDate, DailyPoint> result = new LinkedHashMap<>();
        jdbc.query(sql, params(vendorId, since), rs -> {
            LocalDate day = rs.getObject("day", LocalDate.class);
            result.put(day, new DailyPoint(day, rs.getLong("gross"), rs.getLong("order_count")));
        });
        return result;
    }

    public List<RecentItem> recent(UUID vendorId, int limit) {
        String sql = "SELECT oi.id AS item_id, o.id AS order_id, o.paid_at AS paid_at, "
                + "oi.product_name AS product_name, oi.quantity AS quantity, "
                + "oi.line_total_cents AS line_total_cents, oi.fulfillment_status AS fulfillment_status "
                + FROM_ITEMS
                + "WHERE oi.vendor_id = :vendorId AND o.status = 'PAID' "
                + "ORDER BY o.paid_at DESC, oi.id LIMIT :limit";
        MapSqlParameterSource p = new MapSqlParameterSource()
                .addValue("vendorId", vendorId)
                .addValue("limit", limit);
        return jdbc.query(sql, p, (rs, i) -> new RecentItem(
                rs.getObject("item_id", UUID.class),
                rs.getObject("order_id", UUID.class),
                rs.getObject("paid_at", OffsetDateTime.class).toInstant(),
                rs.getString("product_name"),
                rs.getInt("quantity"),
                rs.getLong("line_total_cents"),
                FulfillmentStatus.valueOf(rs.getString("fulfillment_status"))));
    }

    private static MapSqlParameterSource params(UUID vendorId, Instant since) {
        // pgjdbc does not accept java.time.Instant directly, so we bind an OffsetDateTime.
        return new MapSqlParameterSource()
                .addValue("vendorId", vendorId)
                .addValue("since", OffsetDateTime.ofInstant(since, ZoneOffset.UTC));
    }
}