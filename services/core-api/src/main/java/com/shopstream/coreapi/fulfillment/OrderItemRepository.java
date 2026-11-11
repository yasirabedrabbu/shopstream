package com.shopstream.coreapi.fulfillment;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.shopstream.coreapi.order.FulfillmentStatus;
import com.shopstream.coreapi.order.OrderItem;
import com.shopstream.coreapi.order.OrderStatus;

public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {

    @Query(value = "select i from OrderItem i join fetch i.order o "
            + "where i.vendorId = :vendorId and o.status = :orderStatus "
            + "order by o.createdAt desc, i.id",
            countQuery = "select count(i) from OrderItem i "
                    + "where i.vendorId = :vendorId and i.order.status = :orderStatus")
    Page<OrderItem> findForVendor(@Param("vendorId") UUID vendorId,
            @Param("orderStatus") OrderStatus orderStatus, Pageable pageable);

    @Query(value = "select i from OrderItem i join fetch i.order o "
            + "where i.vendorId = :vendorId and o.status = :orderStatus "
            + "and i.fulfillmentStatus = :fulfillment "
            + "order by o.createdAt desc, i.id",
            countQuery = "select count(i) from OrderItem i "
                    + "where i.vendorId = :vendorId and i.order.status = :orderStatus "
                    + "and i.fulfillmentStatus = :fulfillment")
    Page<OrderItem> findForVendorByFulfillment(@Param("vendorId") UUID vendorId,
            @Param("orderStatus") OrderStatus orderStatus,
            @Param("fulfillment") FulfillmentStatus fulfillment, Pageable pageable);

    /** Only returns the item if it belongs to this vendor. */
    @Query("select i from OrderItem i join fetch i.order o where i.id = :id and i.vendorId = :vendorId")
    Optional<OrderItem> findOwned(@Param("id") UUID id, @Param("vendorId") UUID vendorId);
}