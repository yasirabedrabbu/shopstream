package com.shopstream.coreapi.payment;

import java.util.Map;
import java.util.UUID;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import com.shopstream.coreapi.common.ApiException;

/**
 * Local-dev only. Enabled when app.payment.mock-enabled=true (env PAYMENT_MOCK_ENABLED).
 * The browser "pay now" button calls POST /api/v1/payments/mock/{ref}/confirm (MockPaymentController),
 * which builds the event with confirmationEvent() and hands it to PaymentService.handleEvent.
 */
@Component
@ConditionalOnProperty(name = "app.payment.mock-enabled", havingValue = "true")
public class MockPaymentGateway implements PaymentGateway {

    @Override
    public PaymentProvider provider() {
        return PaymentProvider.MOCK;
    }

    @Override
    public CreatedPayment create(CheckoutContext context) {
        return new CreatedPayment(context.paymentId().toString(), null);
    }

    /**
     * Builds the event for the mock "pay now" button. No amount and no currency are sent,
     * so the amount check is skipped (only the mock does that). The event id is the same for
     * the same reference and outcome, so pressing the button twice is safe.
     */
    public PaymentEvent confirmationEvent(String providerReference, boolean success) {
        return new PaymentEvent(
                "mock_" + providerReference + (success ? "_ok" : "_failed"),
                providerReference,
                success ? PaymentEvent.Outcome.SUCCEEDED : PaymentEvent.Outcome.FAILED);
    }

    /** The mock has no real webhooks. Use confirmationEvent() through MockPaymentController. */
    @Override
    public PaymentEvent parseEvent(String rawBody, Map<String, String> headers) {
        throw new ApiException(HttpStatus.BAD_REQUEST, "Mock gateway does not use webhooks");
    }

    /** Mock refund always succeeds and returns a fake reference. */
    @Override
    public RefundResult refund(String providerReference, long amountCents, String currency,
            String bankTranId, String valId) {
        return new RefundResult("MOCK-REFUND-" + UUID.randomUUID());
    }
}