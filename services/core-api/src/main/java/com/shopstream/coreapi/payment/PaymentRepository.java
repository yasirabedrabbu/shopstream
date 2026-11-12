package com.shopstream.coreapi.payment;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByProviderAndProviderReference(PaymentProvider provider, String providerReference);

    List<Payment> findByOrderId(UUID orderId);

    List<Payment> findByOrderIdAndStatus(UUID orderId, PaymentStatus status);

    /** Admin review list: every payment still waiting for a person. Sort comes from the Pageable. */
    Page<Payment> findByReviewReasonIsNotNullAndReviewResolvedAtIsNull(Pageable pageable);

    /** Same list, narrowed to one reason (HELD, LATE_PAYMENT, ...). */
    Page<Payment> findByReviewReasonAndReviewResolvedAtIsNull(PaymentReviewReason reason, Pageable pageable);

    /** Reads only the order id, so the caller can lock the order before loading the payment. */
    @Query("select p.orderId from Payment p where p.id = :id")
    Optional<UUID> findOrderIdById(@Param("id") UUID id);
}