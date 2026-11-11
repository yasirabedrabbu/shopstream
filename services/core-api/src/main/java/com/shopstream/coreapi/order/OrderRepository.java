package com.shopstream.coreapi.order;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import jakarta.persistence.LockModeType;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    @EntityGraph(attributePaths = "items")
    Optional<Order> findByIdAndCustomerId(UUID id, UUID customerId);

    Page<Order> findByCustomerId(UUID customerId, Pageable pageable);

    List<Order> findByStatusAndReservationExpiresAtBefore(OrderStatus status, Instant cutoff);

    List<Order> findByStatusAndUpdatedAtAfter(OrderStatus status, Instant since);

    /**
     * Loads the order and locks its row until the transaction ends.
     * Payment and expiry both use this, so they can never change the same order at the same time.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Order> findWithLockById(UUID id);
}