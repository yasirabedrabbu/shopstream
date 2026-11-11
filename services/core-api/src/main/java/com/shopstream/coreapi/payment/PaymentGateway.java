package com.shopstream.coreapi.payment;

import java.util.Map;
import java.util.UUID;

/** One adapter per provider (Stripe, SSLCommerz, bKash, mock). */
public interface PaymentGateway {

    record CreatedPayment(String providerReference, String clientSecret) {
    }

    record PaymentEvent(String eventId, String providerReference, Outcome outcome) {
        public enum Outcome {
            SUCCEEDED,
            FAILED
        }
    }

    PaymentProvider provider();

    /** Ask the provider to start a payment. Remote call, never run inside a DB transaction. */
    CreatedPayment create(UUID orderId, UUID paymentId, long amountCents, String currency);

    /** Verify the signature and translate a webhook body. Throw ApiException(400) when invalid. */
    PaymentEvent parseEvent(String rawBody, Map<String, String> headers);
}