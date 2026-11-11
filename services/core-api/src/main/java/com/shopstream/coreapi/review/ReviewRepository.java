package com.shopstream.coreapi.review;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.shopstream.coreapi.order.FulfillmentStatus;
import com.shopstream.coreapi.order.OrderStatus;

public interface ReviewRepository extends JpaRepository<Review, UUID> {

    Optional<Review> findByProductIdAndCustomerId(UUID productId, UUID customerId);

    Page<Review> findByProductId(UUID productId, Pageable pageable);

    /** True when this customer has a delivered item of this product in a paid order. */
    @Query("select count(i) > 0 from OrderItem i join i.order o "
            + "where o.customerId = :customerId and i.productId = :productId "
            + "and o.status = :orderStatus and i.fulfillmentStatus = :fulfillment")
    boolean hasPurchased(@Param("customerId") UUID customerId, @Param("productId") UUID productId,
            @Param("orderStatus") OrderStatus orderStatus, @Param("fulfillment") FulfillmentStatus fulfillment);

    /** Rows of (rating, how many reviews have that rating). */
    @Query("select r.rating, count(r) from Review r where r.productId = :productId group by r.rating")
    List<Object[]> countByRating(@Param("productId") UUID productId);

    /** Rows of (Review, Product) for every review on this vendor's products, newest first. Pass an unsorted Pageable. */
    @Query(value = "select r, p from Review r join Product p on p.id = r.productId "
            + "where p.vendor.id = :vendorId order by r.createdAt desc, r.id",
            countQuery = "select count(r) from Review r join Product p on p.id = r.productId "
                    + "where p.vendor.id = :vendorId")
    Page<Object[]> findForVendor(@Param("vendorId") UUID vendorId, Pageable pageable);
}