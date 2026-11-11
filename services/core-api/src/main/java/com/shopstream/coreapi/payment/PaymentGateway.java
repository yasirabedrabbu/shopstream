package com.shopstream.coreapi.payment;

import java.util.Map;
import java.util.UUID;

/** One adapter per provider (Stripe, SSLCommerz, bKash, mock). */
public interface PaymentGateway {

    /** Everything a provider may ask for when a payment starts. Built from our own database, never from the browser. */
    record CheckoutContext(
            UUID orderId,
            UUID paymentId,
            long amountCents,
            String currency,
            String customerName,
            String customerEmail,
            String phone,
            String addressLine1,
            String city,
            String state,
            String postalCode,
            String country,
            int itemCount,
            String productSummary) {
    }

    /** redirectUrl is where the browser goes to pay (hosted pages). It is null when the provider has none. */
    record CreatedPayment(String providerReference, String clientSecret, String redirectUrl) {

        public CreatedPayment(String providerReference, String clientSecret) {
            this(providerReference, clientSecret, null);
        }
    }

    /**
     * amountCents and currency are what the provider says the customer really paid.
     * Real gateways must fill them (from the provider's own verified response, never from the
     * browser). They stay null only for the mock gateway, which skips the amount check.
     * The bank and validation ids are kept on the payment because a refund needs them.
     */
    record PaymentEvent(String eventId, String providerReference, Outcome outcome,
            Long amountCents, String currency, String bankTranId, String valId) {

        public PaymentEvent(String eventId, String providerReference, Outcome outcome) {
            this(eventId, providerReference, outcome, null, null, null, null);
        }

        public PaymentEvent(String eventId, String providerReference, Outcome outcome,
                Long amountCents, String currency) {
            this(eventId, providerReference, outcome, amountCents, currency, null, null);
        }

        public enum Outcome {
            SUCCEEDED,
            FAILED,
            /** The provider says paid, but flagged it risky. The order stays unpaid and a person reviews it. */
            HELD
        }
    }

    /** What the gateway returns after a refund call. */
    record RefundResult(String refundReference) {
    }

    PaymentProvider provider();

    /** Ask the provider to start a payment. Remote call, never run inside a DB transaction. */
    CreatedPayment create(CheckoutContext context);

    /** Verify the signature and translate a webhook body. Throw ApiException(400) when invalid. */
    PaymentEvent parseEvent(String rawBody, Map<String, String> headers);

    /**
     * Ask the provider to refund a payment. Remote call, never run inside a DB transaction.
     * amountCents is the full payment amount (partial refunds not supported yet).
     * bankTranId and valId come from the payment row (SSLCOMMERZ needs them).
     * Throw ApiException on failure.
     */
    RefundResult refund(String providerReference, long amountCents, String currency,
            String bankTranId, String valId);
}