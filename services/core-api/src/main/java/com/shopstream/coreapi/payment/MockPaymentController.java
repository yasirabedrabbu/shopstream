package com.shopstream.coreapi.payment;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Dev-only "pay now" button. Exists only when app.payment.mock-enabled=true. */
@RestController
@RequestMapping("/api/v1/payments/mock")
@ConditionalOnProperty(name = "app.payment.mock-enabled", havingValue = "true")
public class MockPaymentController {

    private final MockPaymentGateway mock;
    private final PaymentService paymentService;

    public MockPaymentController(MockPaymentGateway mock, PaymentService paymentService) {
        this.mock = mock;
        this.paymentService = paymentService;
    }

    @PostMapping("/{providerReference}/confirm")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void confirm(@PathVariable String providerReference,
            @RequestParam(defaultValue = "true") boolean success) {
        paymentService.handleEvent(PaymentProvider.MOCK, mock.confirmationEvent(providerReference, success));
    }
}