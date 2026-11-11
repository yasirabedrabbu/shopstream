package com.shopstream.coreapi.payment;

import java.util.Map;
import java.util.UUID;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import com.shopstream.coreapi.common.ApiException;
import org.springframework.http.HttpStatus;

/**
 * Local-dev only. Enabled when payment.mock.enabled=true.
 * Webhooks arrive via POST /api/v1/payments/mock/{ref}/confirm (MockPaymentController).
 */
@Component
@ConditionalOnProperty(name = "payment.mock.enabled", havingValue = "true")
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
     * The mock controller calls PaymentService.handleEvent directly,
     * so this method is never reached in normal local dev.
     * It is here only so the interface is complete.
     */
    @Override
    public PaymentEvent parseEvent(String rawBody, Map<String, String> headers) {
        throw new ApiException(HttpStatus.BAD_REQUEST, "Mock gateway does not use webhooks");
    }

    /** Mock refund always succeeds. Returns a fake reference. */
    @Override
    public RefundResult refund(String providerReference, long amountCents, String currency,
            String bankTranId, String valId) {
        return new RefundResult("MOCK-REFUND-" + UUID.randomUUID());
    }
}