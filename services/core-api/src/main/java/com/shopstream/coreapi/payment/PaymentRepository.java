package com.shopstream.coreapi.payment;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByProviderAndProviderReference(PaymentProvider provider, String providerReference);

    List<Payment> findByOrderId(UUID orderId);

    List<Payment> findByOrderIdAndStatus(UUID orderId, PaymentStatus status);
}