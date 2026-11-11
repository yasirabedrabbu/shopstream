package com.shopstream.coreapi.config;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shopstream.coreapi.catalog.Category;
import com.shopstream.coreapi.catalog.CategoryRepository;
import com.shopstream.coreapi.catalog.Product;
import com.shopstream.coreapi.catalog.ProductRepository;
import com.shopstream.coreapi.catalog.ProductStatus;
import com.shopstream.coreapi.common.Slugs;
import com.shopstream.coreapi.user.Role;
import com.shopstream.coreapi.user.User;
import com.shopstream.coreapi.user.UserRepository;
import com.shopstream.coreapi.vendor.Vendor;
import com.shopstream.coreapi.vendor.VendorRepository;
import com.shopstream.coreapi.vendor.VendorStatus;

/**
 * One-time DummyJSON seed. Only runs when app.seed.enabled=true AND the products table is empty.
 * Runs after AdminSeeder (Order 2 vs default Order 0).
 *
 * What it creates:
 *   - Categories from DummyJSON product categories
 *   - 3 vendor users + vendor rows (store approved)
 *   - Up to 194 products spread across those vendors (all ACTIVE)
 *
 * Images: DummyJSON thumbnail URLs are used directly (CDN, no local storage needed).
 * Prices: DummyJSON prices are in USD (float). We convert to cents.
 * Stock: DummyJSON stock field is used directly.
 */
@Component
@Order(2)
public class DummyJsonSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DummyJsonSeeder.class);
    private static final String DUMMYJSON_BASE = "https://dummyjson.com";
    private static final int    PRODUCTS_LIMIT = 194;

    private final boolean enabled;
    private final String vendorPassword;
    private final UserRepository users;
    private final VendorRepository vendors;
    private final CategoryRepository categories;
    private final ProductRepository products;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper json;
    private final HttpClient http;

    public DummyJsonSeeder(
            @Value("${app.seed.enabled:false}") boolean enabled,
            @Value("${app.seed.vendor-password:}") String vendorPassword,
            UserRepository users,
            VendorRepository vendors,
            CategoryRepository categories,
            ProductRepository products,
            PasswordEncoder passwordEncoder,
            ObjectMapper json) {
        this.enabled = enabled;
        this.vendorPassword = vendorPassword;
        this.users = users;
        this.vendors = vendors;
        this.categories = categories;
        this.products = products;
        this.passwordEncoder = passwordEncoder;
        this.json = json;
        this.http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!enabled) {
            log.info("Seed disabled (app.seed.enabled=false). Skipping.");
            return;
        }
        if (!StringUtils.hasText(vendorPassword) || vendorPassword.length() < 8) {
            throw new IllegalStateException("app.seed.vendor-password must be at least 8 characters");
        }
        if (products.count() > 0) {
            log.info("Products table is not empty. Seed skipped.");
            return;
        }

        log.info("Starting DummyJSON seed...");

        // 1. Fetch and create categories.
        List<String> categoryNames = fetchCategories();
        List<Category> savedCategories = new ArrayList<>();
        for (String name : categoryNames) {
            String slug = Slugs.from(name);
            Category cat = new Category(name, slug);
            savedCategories.add(categories.save(cat));
        }
        log.info("Seeded {} categories", savedCategories.size());

        // 2. Create 3 vendor users.
        Vendor[] seedVendors = new Vendor[3];
        String[][] vendorDefs = {
            {"vendor1@shopstream.local", "Demo Vendor One",   "demo-vendor-one",   "Electronics and gadgets store."},
            {"vendor2@shopstream.local", "Demo Vendor Two",   "demo-vendor-two",   "Fashion and lifestyle brand."},
            {"vendor3@shopstream.local", "Demo Vendor Three", "demo-vendor-three", "Home and kitchen goods."}
        };
        for (int i = 0; i < vendorDefs.length; i++) {
            String[] d = vendorDefs[i];
            User u = new User(d[0], passwordEncoder.encode(vendorPassword), d[1], Role.VENDOR);
            users.save(u);
            Vendor v = new Vendor(u.getId(), d[1], d[2], d[3]);
            v.setStatus(VendorStatus.APPROVED);
            vendors.save(v);
            seedVendors[i] = v;
        }
        log.info("Seeded 3 vendor accounts");

        // 3. Fetch and create products.
        List<JsonNode> productNodes = fetchProducts();
        int created = 0;
        for (int i = 0; i < productNodes.size(); i++) {
            JsonNode p = productNodes.get(i);
            Vendor vendor = seedVendors[i % seedVendors.length];
            Category category = resolveCategory(savedCategories, p.path("category").asText());

            String name  = p.path("title").asText("Product " + i);
            String slug  = uniqueSlug(name);
            String desc  = p.path("description").asText("");
            long   cents = toCents(p.path("price").asDouble(1.0));
            int    stock = Math.max(p.path("stock").asInt(10), 1);

            List<String> images = new ArrayList<>();
            String thumb = p.path("thumbnail").asText("");
            if (StringUtils.hasText(thumb)) images.add(thumb);
            JsonNode imgs = p.path("images");
            if (imgs.isArray()) {
                for (JsonNode img : imgs) {
                    String url = img.asText("");
                    if (StringUtils.hasText(url) && !url.equals(thumb)) images.add(url);
                }
            }

            Product product = new Product(vendor, category, name, slug, desc,
                    cents, "USD", stock, ProductStatus.ACTIVE, images);
            products.save(product);
            created++;
        }
        log.info("Seeded {} products", created);
        log.info("DummyJSON seed complete.");
    }

    private List<String> fetchCategories() {
        try {
            String body = get(DUMMYJSON_BASE + "/products/category-list");
            JsonNode node = json.readTree(body);
            List<String> names = new ArrayList<>();
            if (node.isArray()) {
                for (JsonNode n : node) {
                    String raw = n.asText("");
                    if (StringUtils.hasText(raw)) {
                        // Convert slug-style "smartphones" to "Smartphones"
                        String display = raw.substring(0, 1).toUpperCase()
                                + raw.substring(1).replace("-", " ");
                        names.add(display);
                    }
                }
            }
            return names;
        } catch (Exception ex) {
            throw new IllegalStateException("Could not fetch DummyJSON categories", ex);
        }
    }

    private List<JsonNode> fetchProducts() {
        try {
            String body = get(DUMMYJSON_BASE + "/products?limit=" + PRODUCTS_LIMIT + "&skip=0&select=title,description,price,stock,category,thumbnail,images");
            JsonNode root = json.readTree(body);
            List<JsonNode> list = new ArrayList<>();
            JsonNode arr = root.path("products");
            if (arr.isArray()) {
                for (JsonNode p : arr) list.add(p);
            }
            return list;
        } catch (Exception ex) {
            throw new IllegalStateException("Could not fetch DummyJSON products", ex);
        }
    }

    private Category resolveCategory(List<Category> saved, String dummyCategory) {
        // Try to match by name (case-insensitive, strip hyphens).
        String normalized = dummyCategory.replace("-", " ").toLowerCase();
        return saved.stream()
                .filter(c -> c.getName().toLowerCase().contains(normalized)
                        || normalized.contains(c.getName().toLowerCase()))
                .findFirst()
                .orElse(saved.get(0)); // fallback to first category
    }

    private String uniqueSlug(String name) {
        String base = Slugs.from(name);
        if (!products.existsBySlug(base)) return base;
        for (int i = 2; i < 1000; i++) {
            String candidate = base + "-" + i;
            if (!products.existsBySlug(candidate)) return candidate;
        }
        return base + "-" + UUID.randomUUID().toString().substring(0, 8);
    }

    private static long toCents(double price) {
        return Math.round(price * 100);
    }

    private String get(String url) {
        try {
            HttpRequest req = HttpRequest.newBuilder(URI.create(url))
                    .timeout(Duration.ofSeconds(15))
                    .GET().build();
            HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() != 200) {
                throw new IllegalStateException("DummyJSON returned HTTP " + resp.statusCode());
            }
            return resp.body();
        } catch (java.io.IOException ex) {
            throw new IllegalStateException("Could not reach DummyJSON", ex);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Interrupted", ex);
        }
    }
}