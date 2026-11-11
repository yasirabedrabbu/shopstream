package com.shopstream.coreapi.payment;

import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.shopstream.coreapi.common.ApiException;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

@RestController
@RequestMapping("/api/v1")
public class PaymentController {

    public record PayRequest(@NotNull PaymentProvider provider) {
    }

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/orders/{orderId}/pay")
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentService.Session pay(@AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID orderId,
            @Valid @RequestBody PayRequest request) {
        return paymentService.start(UUID.fromString(jwt.getSubject()), orderId, request.provider());
    }

    /** Public on purpose. Authenticity comes from the provider's signature, checked inside the gateway. */
    @PostMapping("/payments/webhooks/{provider}")
    @ResponseStatus(HttpStatus.OK)
    public void webhook(@PathVariable String provider,
            @RequestBody String rawBody,
            @RequestHeader HttpHeaders headers) {
        PaymentProvider paymentProvider = parseProvider(provider);

        Map<String, String> caseInsensitive = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
        caseInsensitive.putAll(headers.toSingleValueMap());

        PaymentGateway gateway = paymentService.gateway(paymentProvider);
        PaymentGateway.PaymentEvent event = gateway.parseEvent(rawBody, caseInsensitive);
        paymentService.handleEvent(paymentProvider, event);
    }

    private static PaymentProvider parseProvider(String value) {
        try {
            return PaymentProvider.valueOf(value.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Unknown payment provider");
        }
    }
}