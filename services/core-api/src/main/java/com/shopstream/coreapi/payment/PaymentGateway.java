package com.shopstream.coreapi.payment;

import java.util.Map;
import java.util.UUID;

/** One adapter per provider (Stripe, SSLCommerz, bKash, mock). */
public interface PaymentGateway {

    record CreatedPayment(String providerReference, String clientSecret) {
    }

    /**
     * amountCents and currency are what the provider says the customer really paid.
     * Real gateways must fill them (from the provider's own verified response, never from the
     * browser). They stay null only for the mock gateway, which skips the amount check.
     */
    record PaymentEvent(String eventId, String providerReference, Outcome outcome,
            Long amountCents, String currency) {

        public PaymentEvent(String eventId, String providerReference, Outcome outcome) {
            this(eventId, providerReference, outcome, null, null);
        }

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