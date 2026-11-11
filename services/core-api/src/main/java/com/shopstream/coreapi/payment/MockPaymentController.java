package com.shopstream.coreapi.payment;

import java.util.UUID;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.shopstream.coreapi.common.ApiException;
import com.shopstream.coreapi.order.Order;
import com.shopstream.coreapi.order.OrderRepository;

/** Dev-only "pay now" button. Exists only when app.payment.mock-enabled=true. */
@RestController
@RequestMapping("/api/v1/payments/mock")
@ConditionalOnProperty(name = "app.payment.mock-enabled", havingValue = "true")
public class MockPaymentController {

    private final MockPaymentGateway mock;
    private final PaymentService paymentService;
    private final PaymentRepository payments;
    private final OrderRepository orders;

    public MockPaymentController(MockPaymentGateway mock, PaymentService paymentService,
            PaymentRepository payments, OrderRepository orders) {
        this.mock = mock;
        this.paymentService = paymentService;
        this.payments = payments;
        this.orders = orders;
    }

    @PostMapping("/{providerReference}/confirm")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void confirm(@AuthenticationPrincipal Jwt jwt,
            @PathVariable String providerReference,
            @RequestParam(defaultValue = "true") boolean success) {
        UUID callerId = UUID.fromString(jwt.getSubject());

        // Only the customer who owns the order may confirm its mock payment.
        Payment payment = payments
                .findByProviderAndProviderReference(PaymentProvider.MOCK, providerReference)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Payment not found"));
        Order order = orders.findById(payment.getOrderId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Payment not found"));
        if (!order.getCustomerId().equals(callerId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Payment not found");
        }

        paymentService.handleEvent(PaymentProvider.MOCK, mock.confirmationEvent(providerReference, success));
    }
}