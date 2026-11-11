package com.shopstream.coreapi.payment;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shopstream.coreapi.common.ApiException;

/**
 * SSLCOMMERZ hosted checkout. Only exists when app.payment.sslcommerz.enabled=true.
 * The browser is sent to the hosted page. We never trust what the browser or the notification says
 * about money: every success is re-checked with SSLCOMMERZ's own validation API.
 */
@Component
@ConditionalOnProperty(name = "app.payment.sslcommerz.enabled", havingValue = "true")
public class SslCommerzGateway implements PaymentGateway {

    private static final Logger log = LoggerFactory.getLogger(SslCommerzGateway.class);

    private static final String SANDBOX_BASE = "https://sandbox.sslcommerz.com";
    private static final String LIVE_BASE = "https://securepay.sslcommerz.com";
    private static final String SESSION_PATH = "/gwprocess/v4/api.php";
    private static final String VALIDATE_PATH = "/validator/api/validationserverAPI.php";

    private final String storeId;
    private final String storePassword;
    private final String baseUrl;
    private final String apiPublicUrl;
    private final ObjectMapper json;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

    public SslCommerzGateway(
            @Value("${app.payment.sslcommerz.store-id}") String storeId,
            @Value("${app.payment.sslcommerz.store-password}") String storePassword,
            @Value("${app.payment.sslcommerz.sandbox:true}") boolean sandbox,
            @Value("${app.api-public-url}") String apiPublicUrl,
            ObjectMapper json) {
        if (!StringUtils.hasText(storeId) || !StringUtils.hasText(storePassword)) {
            throw new IllegalStateException(
                    "SSLCOMMERZ is enabled but SSLCOMMERZ_STORE_ID or SSLCOMMERZ_STORE_PASSWORD is missing");
        }
        this.storeId = storeId.trim();
        this.storePassword = storePassword.trim();
        this.baseUrl = sandbox ? SANDBOX_BASE : LIVE_BASE;
        this.apiPublicUrl = apiPublicUrl.trim().endsWith("/")
                ? apiPublicUrl.trim().substring(0, apiPublicUrl.trim().length() - 1)
                : apiPublicUrl.trim();
        this.json = json;
        log.info("SSLCOMMERZ gateway enabled in {} mode", sandbox ? "SANDBOX" : "LIVE");
        if (!sandbox && this.apiPublicUrl.contains("localhost")) {
            log.warn("SSLCOMMERZ is LIVE but API_PUBLIC_URL points to localhost. Notifications cannot reach you.");
        }
    }

    @Override
    public PaymentProvider provider() {
        return PaymentProvider.SSLCOMMERZ;
    }

    @Override
    public CreatedPayment create(CheckoutContext c) {
        // SSLCOMMERZ allows at most 30 characters for tran_id, so a full UUID does not fit.
        String tranId = "SS" + UUID.randomUUID().toString().replace("-", "").substring(0, 28);
        String country = countryName(c.country());

        Map<String, String> form = new LinkedHashMap<>();
        form.put("store_id", storeId);
        form.put("store_passwd", storePassword);
        form.put("total_amount", BigDecimal.valueOf(c.amountCents(), 2).toPlainString());
        form.put("currency", c.currency());
        form.put("tran_id", tranId);
        form.put("success_url", apiPublicUrl + "/api/v1/payments/sslcommerz/success");
        form.put("fail_url", apiPublicUrl + "/api/v1/payments/sslcommerz/fail");
        form.put("cancel_url", apiPublicUrl + "/api/v1/payments/sslcommerz/cancel");
        form.put("ipn_url", apiPublicUrl + "/api/v1/payments/webhooks/sslcommerz");
        form.put("cus_name", cut(c.customerName(), 50));
        form.put("cus_email", c.customerEmail());
        form.put("cus_add1", cut(c.addressLine1(), 50));
        form.put("cus_city", cut(c.city(), 50));
        form.put("cus_state", cut(c.state(), 50));
        form.put("cus_postcode", cut(c.postalCode(), 30));
        form.put("cus_country", cut(country, 50));
        form.put("cus_phone", cut(c.phone(), 20));
        form.put("shipping_method", "Courier");
        form.put("ship_name", cut(c.customerName(), 50));
        form.put("ship_add1", cut(c.addressLine1(), 50));
        form.put("ship_city", cut(c.city(), 50));
        form.put("ship_state", cut(c.state(), 50));
        form.put("ship_postcode", cut(c.postalCode(), 50));
        form.put("ship_country", cut(country, 50));
        form.put("num_of_item", String.valueOf(c.itemCount()));
        form.put("product_name", cut(c.productSummary(), 255));
        form.put("product_category", "ecommerce");
        form.put("product_profile", "physical-goods");
        form.put("value_a", c.orderId().toString());
        form.put("value_b", c.paymentId().toString());

        JsonNode answer = readJson(post(baseUrl + SESSION_PATH, form));
        String pageUrl = text(answer, "GatewayPageURL");
        if (!"SUCCESS".equalsIgnoreCase(text(answer, "status")) || !StringUtils.hasText(pageUrl)) {
            throw new IllegalStateException("SSLCOMMERZ refused the session: " + text(answer, "failedreason"));
        }
        return new CreatedPayment(tranId, null, pageUrl);
    }

    /** Called for the server-to-server notification. The body is a form, not JSON. */
    @Override
    public PaymentEvent parseEvent(String rawBody, Map<String, String> headers) {
        try {
            return eventFromParams(parseForm(rawBody));
        } catch (IllegalArgumentException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid payment notification");
        }
    }

    /**
     * Turns a notification or a browser return into an event.
     * Only val_id is used from the request. Everything about the money comes from the validation answer.
     */
    public PaymentEvent eventFromParams(Map<String, String> params) {
        String status = params.getOrDefault("status", "");
        String claimedTranId = params.getOrDefault("tran_id", "");
        String valId = params.getOrDefault("val_id", "");

        boolean claimsPaid = "VALID".equalsIgnoreCase(status) || "VALIDATED".equalsIgnoreCase(status);
        if (!claimsPaid) {
            if (!StringUtils.hasText(claimedTranId)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid payment notification");
            }
            String label = StringUtils.hasText(status) ? status.toUpperCase(Locale.ROOT) : "UNKNOWN";
            return new PaymentEvent("sslcz_" + claimedTranId + "_" + label, claimedTranId,
                    PaymentEvent.Outcome.FAILED);
        }
        if (!StringUtils.hasText(valId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid payment notification");
        }

        JsonNode checked = validate(valId);
        String checkedStatus = text(checked, "status");
        String tranId = text(checked, "tran_id");
        if (!"VALID".equalsIgnoreCase(checkedStatus) && !"VALIDATED".equalsIgnoreCase(checkedStatus)) {
            log.warn("SSLCOMMERZ validation rejected val_id {} with status {}", valId, checkedStatus);
            throw new ApiException(HttpStatus.BAD_REQUEST, "Payment could not be verified");
        }
        if (StringUtils.hasText(claimedTranId) && !claimedTranId.equals(tranId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Payment notification does not match");
        }

        long cents;
        try {
            cents = new BigDecimal(text(checked, "currency_amount"))
                    .movePointRight(2)
                    .setScale(0, RoundingMode.UNNECESSARY)
                    .longValueExact();
        } catch (NumberFormatException | ArithmeticException ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Payment provider sent an unreadable amount");
        }
        String currency = text(checked, "currency_type");
        PaymentEvent.Outcome outcome = "1".equals(text(checked, "risk_level"))
                ? PaymentEvent.Outcome.HELD
                : PaymentEvent.Outcome.SUCCEEDED;

        return new PaymentEvent("sslcz_val_" + valId, tranId, outcome, cents, currency,
                text(checked, "bank_tran_id"), valId);
    }

    private JsonNode validate(String valId) {
        Map<String, String> query = new LinkedHashMap<>();
        query.put("val_id", valId);
        query.put("store_id", storeId);
        query.put("store_passwd", storePassword);
        query.put("format", "json");
        try {
            return readJson(get(baseUrl + VALIDATE_PATH, query));
        } catch (IllegalStateException ex) {
            log.error("SSLCOMMERZ validation call failed for val_id {}", valId, ex);
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Could not verify the payment right now");
        }
    }

    // ---------- small helpers ----------

    private String post(String url, Map<String, String> form) {
        HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                .timeout(Duration.ofSeconds(20))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(formEncode(form)))
                .build();
        return send(request);
    }

    private String get(String url, Map<String, String> query) {
        HttpRequest request = HttpRequest.newBuilder(URI.create(url + "?" + formEncode(query)))
                .timeout(Duration.ofSeconds(20))
                .GET()
                .build();
        return send(request);
    }

    private String send(HttpRequest request) {
        try {
            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                throw new IllegalStateException("SSLCOMMERZ answered HTTP " + response.statusCode());
            }
            return response.body();
        } catch (IOException ex) {
            throw new IllegalStateException("Could not reach SSLCOMMERZ", ex);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Interrupted while calling SSLCOMMERZ", ex);
        }
    }

    private JsonNode readJson(String body) {
        try {
            return json.readTree(body);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("SSLCOMMERZ sent an unreadable answer", ex);
        }
    }

    private static String text(JsonNode node, String field) {
        return node.path(field).asText("");
    }

    private static String cut(String value, int max) {
        if (value == null) {
            return null;
        }
        return value.length() > max ? value.substring(0, max) : value;
    }

    private static String countryName(String code) {
        if (!StringUtils.hasText(code)) {
            return code;
        }
        String name = Locale.of("", code.trim().toUpperCase(Locale.ROOT)).getDisplayCountry(Locale.ENGLISH);
        return StringUtils.hasText(name) ? name : code;
    }

    private static String formEncode(Map<String, String> form) {
        return form.entrySet().stream()
                .filter(e -> StringUtils.hasText(e.getValue()))
                .map(e -> URLEncoder.encode(e.getKey(), StandardCharsets.UTF_8)
                        + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
                .collect(Collectors.joining("&"));
    }

    private static Map<String, String> parseForm(String body) {
        Map<String, String> map = new LinkedHashMap<>();
        if (!StringUtils.hasText(body)) {
            return map;
        }
        for (String pair : body.split("&")) {
            if (pair.isEmpty()) {
                continue;
            }
            int eq = pair.indexOf('=');
            String key = eq < 0 ? pair : pair.substring(0, eq);
            String value = eq < 0 ? "" : pair.substring(eq + 1);
            map.put(URLDecoder.decode(key, StandardCharsets.UTF_8),
                    URLDecoder.decode(value, StandardCharsets.UTF_8));
        }
        return map;
    }
}