package com.shopstream.coreapi.payment;

import java.net.URI;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shopstream.coreapi.common.ApiException;

/**
 * Where the customer's browser lands after the SSLCOMMERZ hosted page.
 * Public on purpose, a browser has no JWT here. Nothing in the request is trusted:
 * a success is re-checked with SSLCOMMERZ, and the redirect target is built from our own database.
 */
@RestController
@RequestMapping("/api/v1/payments/sslcommerz")
@ConditionalOnProperty(name = "app.payment.sslcommerz.enabled", havingValue = "true")
public class SslCommerzCallbackController {

    private static final Logger log = LoggerFactory.getLogger(SslCommerzCallbackController.class);

    private final SslCommerzGateway gateway;
    private final PaymentService paymentService;
    private final PaymentRepository payments;
    private final String webBase;

    public SslCommerzCallbackController(SslCommerzGateway gateway, PaymentService paymentService,
            PaymentRepository payments, @Value("${app.public-url}") String publicUrl) {
        this.gateway = gateway;
        this.paymentService = paymentService;
        this.payments = payments;
        String trimmed = publicUrl.trim();
        this.webBase = trimmed.endsWith("/") ? trimmed.substring(0, trimmed.length() - 1) : trimmed;
    }

    @RequestMapping(value = "/success", method = { RequestMethod.GET, RequestMethod.POST })
    public ResponseEntity<Void> success(@RequestParam Map<String, String> params) {
        return process(params, "failed");
    }

    @RequestMapping(value = "/fail", method = { RequestMethod.GET, RequestMethod.POST })
    public ResponseEntity<Void> fail(@RequestParam Map<String, String> params) {
        return process(params, "failed");
    }

    @RequestMapping(value = "/cancel", method = { RequestMethod.GET, RequestMethod.POST })
    public ResponseEntity<Void> cancel(@RequestParam Map<String, String> params) {
        return process(params, "cancelled");
    }

    /** The outcome comes from the verified event, not from which URL the browser used. */
    private ResponseEntity<Void> process(Map<String, String> params, String failedLabel) {
        String result;
        try {
            PaymentGateway.PaymentEvent event = gateway.eventFromParams(params);
            paymentService.handleEvent(PaymentProvider.SSLCOMMERZ, event);
            result = switch (event.outcome()) {
                case SUCCEEDED -> "success";
                case HELD -> "review";
                case FAILED -> failedLabel;
            };
        } catch (ApiException ex) {
            log.warn("SSLCOMMERZ browser return could not be processed: {}", ex.getMessage());
            result = "error";
        } catch (RuntimeException ex) {
            // Never show the customer a raw 500 page after they paid. Send them back to the shop.
            log.error("SSLCOMMERZ browser return failed unexpectedly", ex);
            result = "error";
        }
        return back(params.get("tran_id"), result);
    }

    private ResponseEntity<Void> back(String tranId, String result) {
        String path = "/orders";
        if (tranId != null && !tranId.isBlank()) {
            Optional<Payment> payment = payments
                    .findByProviderAndProviderReference(PaymentProvider.SSLCOMMERZ, tranId);
            if (payment.isPresent()) {
                path = "/orders/" + payment.get().getOrderId();
            }
        }
        URI target = URI.create(webBase + path + "?payment=" + result);
        return ResponseEntity.status(HttpStatus.SEE_OTHER).location(target).build();
    }
}