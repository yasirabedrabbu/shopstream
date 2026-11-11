package com.shopstream.coreapi.payment;

import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import com.shopstream.coreapi.common.ApiException;

/** Dev-only. Lets anyone mark a payment as paid, so it is OFF unless app.payment.mock-enabled=true. */
@Component
@ConditionalOnProperty(name = "app.payment.mock-enabled", havingValue = "true")
public class MockPaymentGateway implements PaymentGateway {

    private static final Logger log = LoggerFactory.getLogger(MockPaymentGateway.class);

    public MockPaymentGateway() {
        log.warn("MockPaymentGateway is ENABLED. Payments can be faked. Never enable this in production.");
    }

    @Override
    public PaymentProvider provider() {
        return PaymentProvider.MOCK;
    }

    @Override
    public CreatedPayment create(UUID orderId, UUID paymentId, long amountCents, String currency) {
        return new CreatedPayment("mock_" + UUID.randomUUID(), "mock-client-secret");
    }

    @Override
    public PaymentEvent parseEvent(String rawBody, Map<String, String> headers) {
        throw new ApiException(HttpStatus.NOT_FOUND, "Mock gateway has no webhook");
    }

    public PaymentEvent confirmationEvent(String providerReference, boolean success) {
        return new PaymentEvent(
                "mock_evt_" + UUID.randomUUID(),
                providerReference,
                success ? PaymentEvent.Outcome.SUCCEEDED : PaymentEvent.Outcome.FAILED);
    }
}