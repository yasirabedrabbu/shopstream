# ShopStream: Handoff v7

Last updated: Core API reviewed by reading (zip snapshot) and 13 fixes applied locally. Next: review batch 2 (see section 13).
Language for chat with the owner: Banglish (Bangla words in English letters). This document is English.

---

## 1. Working rules (strict, follow every time)

1. Never create files with tools. Give the full code in chat with the exact file path. The owner pastes it into VS Code. Reading an uploaded zip or file with tools is allowed when the owner asks.
2. The owner now wants all remaining Java files reviewed and delivered in full (no snippets), in batches. One batch = a few related files. After each batch the owner runs the checks and pastes the PowerShell output.
3. Every batch includes: exact file paths, the PowerShell checks, and the expected output.
4. When a file changes, give the full replacement file. Give code in its final form.
5. Do not assume. Say so when something is wrong. If something is not verified, say "verify kori-ni". Before deploy, ask the owner to check current free tiers and pricing.
6. The code has never been compiled or run (not by Claude, not by the owner). "Verified" only means the owner pasted PowerShell output proving a file or pattern exists. Claude must never promise "no issues" until `mvn compile` has passed.
7. Be strategic and decisive, but in code tasks do what the owner says.
8. No em dashes in written content.
9. PowerShell on this PC is Windows PowerShell 5. Rules for commands:
   - Select-String has no -Recurse. Use: `Get-ChildItem <dir> -Recurse -Filter *.java | Select-String -Pattern '<regex>' | ForEach-Object { "$($_.Filename):$($_.LineNumber)" }`
   - Use single quotes around patterns that contain `\"` or backslashes. Double quotes with escaped quotes break.
   - Give one command per code block. Pasting several lines at once crashed PSReadLine once.
   - A wrapped terminal line does not mean a bug in the file.
10. Select-String is case-insensitive and also matches imports, comments and message strings. Before stating an expected count, check whether the pattern also appears in a comment or an import. If an expected line is missing, treat it as a failure.
11. Migration listing must be sorted numerically:
    `Get-ChildItem services/core-api/src/main/resources/db/migration | Sort-Object { [int](($_.Name -split '__')[0].Substring(1)) } | Select-Object -ExpandProperty Name`
12. Line numbers in expected output can be off by a few lines. What matters is that the expected lines exist.
13. The zip in the chat is a GitHub snapshot. Local fixes are NOT in it. Before reviewing again, ask the owner to upload a fresh zip, or rely on section 7.

---

## 2. Project

ShopStream is a multi-vendor e-commerce platform with zero-oversell flash sales and a live vendor sales and stock dashboard. It is a portfolio project built to production-grade standards. The owner is a UI/UX designer who is learning by building it.

- Repo: https://github.com/yasirabedrabbu/shopstream (branch main)
- Local folder: C:\Users\yasir\shopstream
- Timeline: 12 to 14 weeks (not confirmed)

## 3. Tech stack

| Part | Tech | Status |
|---|---|---|
| apps/web | Next.js (App Router, TypeScript): storefront and vendor/admin dashboard | empty |
| apps/widgets | SvelteKit live widgets | empty |
| services/core-api | Java 21, Spring Boot 3.4.1, Maven | code written, never compiled |
| services/inventory-engine | Rust (Axum, Tokio): atomic reserve, expiry, SSE | empty |
| Infra | Postgres 16, Redis 7 (Streams), Mailpit (docker-compose.yml) | not running yet |

Auth: Java issues RS256 JWT. Rust and Svelte only verify with the public key.

Checkout flow: Next.js creates a Java order (PENDING). Java asks Rust to reserve stock (10 minute hold). Payment happens. Java marks the order PAID and emits an event. Rust finalizes the reservation and pushes SSE.

Seed data: one-time import from DummyJSON (DummyJsonSeeder exists, off by default).

## 4. Owner's PC

Windows 10, i3-7020U (2 cores), 8GB RAM. Run one service at a time. Docker install is blocked (WSL Ubuntu error 0x8000000d, Docker Desktop installer says it cannot run on this PC, not confirmed why). Plan B: Neon (Postgres) and Upstash (Redis). JDK 21, Maven, Rust and Node are not set up yet.

---

## 5. Phase plan (about 150 units, 6 phases)

| Phase | Content | Status |
|---|---|---|
| 1. Finish Java | Step 5 payment/review/refund, Step 6 auth, Step 7 seed | Code exists for all. Review in progress (about 60 percent of files read). Email verify dropped. |
| 2. Setup and first run | JDK, Maven, Neon, RSA keys, env, mvn compile, app boot, SQL bug fixes, sandbox refund test | not started |
| 3. Inventory engine | Rust (reserve, expiry, finalize, SSE, JWT) and Java Step 8 (HttpInventoryClient, Redis Streams) | not started |
| 4. Quality and packaging | Tests, OpenAPI config, Dockerfile, prod profile, GitHub Actions, README, HANDOFF | not started |
| 5. Frontend | Design system, Next.js, Svelte widgets | not started |
| 6. Deploy | Hosting, secrets, domain, SSLCOMMERZ live, final check | not started |

---

## 6. Java core-api: current state

Path: `services/core-api/src/main/java/com/shopstream/coreapi/`. Packages: admin, auth, catalog, common, config, fulfillment, inventory, notification, order, payment, review, stats, user, vendor, web.

### Migrations (V1 to V13, `src/main/resources/db/migration`)

V1 users and vendors, V2 categories/products/product_images, V3 orders and order_items, V4 payments and payment_events, V5 shipping address, V6 notifications, V7 flash sale columns, V8 reviews, V9 orders.paid_at (+CHECK), V10 BLOCKED product status (DO block drops old CHECK), V11 payments.bank_tran_id and val_id, V12 payment review and refund columns, V13 refresh_tokens and password_reset_tokens.
Read against the entities: all columns match, so `ddl-auto: validate` should pass (not run).

### Endpoints

- Public: GET /api/v1/ping, /products, /products/{slug}, /products/flash-sales, /categories, /stores/{slug}, /products/{slug}/reviews, /products/{slug}/reviews/summary.
- Auth (public): POST /auth/register, /login, /refresh, /logout, /password-reset/request, /password-reset/confirm. Rate limited per IP (10 per minute) on login, refresh, password-reset request and confirm.
- Customer: GET /me. Orders: POST, GET, GET/{id}, POST/{id}/cancel. POST /orders/{id}/pay. Notifications: list, unread-count, read, read-all. Reviews: POST /products/{slug}/reviews, PUT and DELETE /products/{slug}/reviews/mine.
- POST /api/v1/orders body: `{ items: [{productId, quantity}], shippingAddress: {fullName, phone, line1, line2?, city, state?, postalCode, country (2-letter)} }`
- Payment: POST /payments/webhooks/{provider} (public, provider verifies). Mock (needs JWT, owner only): POST /payments/mock/{ref}/confirm?success=true. SSLCOMMERZ browser return: /payments/sslcommerz/success, /fail, /cancel (GET and POST, public).
- Vendor: /vendor/store (POST, GET, PUT), /vendor/products (CRUD), PUT and DELETE /vendor/products/{id}/flash-sale, /vendor/orders/items (GET, PATCH .../fulfillment), GET /vendor/reviews, GET /vendor/dashboard?period=7d|30d|all.
- Admin: GET /admin/vendors, PATCH /admin/vendors/{id}/status, POST /admin/categories, PUT and DELETE /admin/categories/{id}, GET /admin/products, POST /admin/products/{id}/block and /unblock, GET /admin/users, PATCH /admin/users/{id}/status, GET /admin/orders, GET /admin/stats, GET /admin/payments/review?reason&page&size (oldest first), POST /admin/payments/review/{paymentId}/resolve, POST /admin/payments/{paymentId}/refund?cancelOrder=true.

### Other

AdminSeeder, DummyJsonSeeder (@Order(2), runs only if app.seed.enabled=true and products table is empty), StubInventoryClient (stock not enforced), MockPaymentGateway, SslCommerzGateway, OrderMaintenanceJobs (expire overdue orders every 60s, cancel stuck PENDING, re-finalize recent PAID), OrderPaidNotifier (30s), EmailService (@Async, Mailpit), LoginRateLimitFilter (Bucket4j in memory). Commission 10 percent, low stock threshold 5.
Enums: OrderStatus (PENDING, AWAITING_PAYMENT, PAID, CANCELLED, EXPIRED), FulfillmentStatus (NEW, PACKED, SHIPPED, DELIVERED, CANCELLED), ProductStatus (DRAFT, ACTIVE, ARCHIVED, BLOCKED), PaymentStatus (PENDING, SUCCEEDED, FAILED), PaymentReviewReason (HELD, LATE_PAYMENT, AMOUNT_MISMATCH, DUPLICATE_CHARGE).
Security: CSRF off, stateless, CORS on, /admin/** needs ADMIN, /vendor/** needs VENDOR or ADMIN, public matchers for ping, auth, webhooks, sslcommerz, GET stores/products/categories.
pom.xml already has springdoc and bucket4j-core 8.10.1 (groupId com.bucket4j, package io.github.bucket4j).

---

## 7. Work log

### Found in the zip but not in v6 (the zip was ahead of the handoff)

Step 5.5 to 5.8 (review controller with resolve endpoint, resolve service, refund controller and service, gateway refund method), Step 6 without email verify (refresh, logout, logoutAll, password reset, rate limit, V13), DummyJsonSeeder.

IMPORTANT: the zip has its own `AdminPaymentReviewController` (list ascending by reviewAt plus resolve). An older version written in chat (descending, list only) must NEVER be pasted over it.

### Fixes applied this session (owner pasted PowerShell output proving each pattern exists; nothing compiled)

| # | File | Fix |
|---|---|---|
| 1 | auth/LoginRateLimitFilter | import io.github.bucket4j (was com.bucket4j, compile error); client IP from getRemoteAddr (X-Forwarded-For was spoofable); also limits /auth/refresh and /auth/password-reset/confirm |
| 2 | payment/MockPaymentGateway | property is app.payment.mock-enabled (was payment.mock.enabled, never matched yml); added confirmationEvent(ref, success) which MockPaymentController calls (was missing, compile error) |
| 3 | order/Order | added cancelAfterRefund(reason) for PAID orders (cancel() rejects PAID) |
| 4 | catalog/ProductRepository | added incrementStock (atomic) |
| 5 | payment/PaymentRepository | added findOrderIdById |
| 6 | admin/AdminRefundService | rewritten, see decisions below |
| 7 | admin/AdminUserService | suspending a user revokes all refresh tokens |
| 8 | payment/SslCommerzGateway | refund now GET /validator/api/merchantTransIDvalidationAPI.php with bank_tran_id, refund_amount, refund_remarks (old POST /merchant/backrequest.php with v_id looked wrong); accepts status success or initiated. UNVERIFIED against the official docs, only taken from 4 third-party client libraries |
| 9 | payment/SslCommerzCallbackController | catches RuntimeException too, always redirects with ?payment=error |
| 10 | config/DummyJsonSeeder | Slugs.slugify (Slugs.from did not exist, compile error); exact slug match for categories (old contains() put womens shoes under Mens shoes) |
| 11 | common/GlobalExceptionHandler | DataIntegrityViolationException returns 409 |
| 12 | user/User | added setPasswordHash (AuthService called it, compile error) |
| 13 | auth/PasswordResetTokenRepository | GitHub snapshot had the name PasswordResetTokenRepository.jav. Local folder has .java. Owner must check `git status --short` and commit and push it |

### Read and judged OK by reading (not compiled, not run)

OrderService, OrderMaintenanceJobs, OrderPaidNotifier, OrderController, PaymentController, PaymentService, Payment, MockPaymentController, VendorStatsRepository and AdminReportRepository (SQL read line by line), JwtConfig, TokenService, AuthService, AuthController, EmailService, SecurityConfig matchers, all 13 migrations against the 12 entities, GlobalExceptionHandler.

### NOT read yet (more compile errors are likely, 5 compile errors were found in the files that were read)

ProductService, ReviewService, FulfillmentService, VendorService, AdminCatalogService, NotificationService, VendorStatsService, AdminReportService, controllers (Product, VendorProduct, VendorOrder, Review, VendorReview, Notification, Vendor, AdminVendor, Category, Store, Me, Ping), AdminSeeder, the top of SecurityConfig, request/response DTO records.

---

## 8. Decisions already made

- Flash sale: sale price, start, end all set or all null (DB CHECK). Sale price below regular price. Max 30 days. Active is computed (start <= now < end), no scheduler.
- Reviews: only a customer with a DELIVERED item in a PAID order. One per customer per product (UNIQUE, race gives 409). Rating 1 to 5, comment max 2000. A vendor cannot review own product.
- Revenue and GMV: only PAID orders, CANCELLED items excluded, date from orders.paid_at, UTC buckets, commission 10 percent of gross.
- Vendor dashboard: one endpoint with revenue, pipeline, low stock, top 5, daily calendar, recent 10.
- Admin: user suspend blocks login and revokes refresh tokens (an existing access token still works until it expires, max 60 minutes). Admin cannot suspend self or another ADMIN. Deleting a category with products returns 409. Unblock sets the product to DRAFT.
- Currency: "USD" hardcoded in stats. Seeded products are USD.
- Payment: SSLCOMMERZ is the primary gateway (code exists). Owner has still not confirmed this in writing. Stripe is not available for Bangladesh-registered businesses (third-party source only). Local dev uses MockPaymentGateway.
- Payment review rules (PaymentService.handleEvent): HELD keeps the payment PENDING and adds a review. AMOUNT_MISMATCH marks the payment SUCCEEDED, order NOT paid, review added. DUPLICATE_CHARGE (order already PAID by another payment) and LATE_PAYMENT (order CANCELLED or EXPIRED) add a review. The first open review reason is kept.
- Refund rules (AdminRefundService):
  - Already refunded: 409.
  - PENDING with a review (HELD): no gateway call, only the review is closed. Not under review: 409.
  - Only SUCCEEDED goes to the gateway.
  - AMOUNT_MISMATCH: 409. We do not store the amount really paid, so an API refund could be wrong. Admin refunds in the SSLCOMMERZ panel, then calls /resolve. Option later: V14 migration that stores paid_amount_cents.
  - DUPLICATE_CHARGE and LATE_PAYMENT never touch the order.
  - cancelOrder=true (default) on a PAID order cancels it and returns stock via incrementStock, but only if no item is SHIPPED or DELIVERED (else 409, use cancelOrder=false).
  - The order row is locked first (same lock order as handleEvent), then the gateway is called inside the transaction. If the gateway throws, nothing commits.
- Email verify: dropped from scope (owner did not answer). Can be added later as its own unit.
- Rate limit: per IP in memory, 10 per minute. In production behind a proxy set server.forward-headers-strategy=native.

## 9. Pending decisions (owner has not answered)

1. Confirm SSLCOMMERZ as primary (A), add Stripe test mode (B), or both (C).
2. Accent color (lime #E8F44A?).
3. Dashboard inside the storefront Next.js app or separate.
4. AI bar: rule-based or free-tier LLM.
5. Timeline: 12 to 14 weeks.
6. Currency for the demo: keep USD (needs SSLCOMMERZ multi-currency, unverified) or switch seeded products and orders to BDT.
7. Email verify: add later or never.

## 10. Known risks and unknowns (all "verify kori-ni")

- Nothing has been compiled. Expect more small errors in the files not yet read.
- SSLCOMMERZ: refund endpoint and response status unverified (see fix 8). Does the sandbox accept USD? Unverified. IPN needs a public URL (localhost will not receive it, use a tunnel or deploy, use Mock locally). Amount for a non-BDT refund: which currency? Unknown.
- If the gateway refund succeeds and the DB commit then fails, the customer got the money but the DB does not know. Fixing this needs an outbox. Accepted for the portfolio.
- Refund with cancelOrder=false leaves the order PAID, so the revenue dashboard still counts it.
- Raw SQL (stats, admin reports) read but never run on Postgres. Also unconfirmed: NamedParameterJdbcTemplate bean, Hibernate record @Embeddable (ShippingAddress), Specification lambdas, PageResponse.of(result, r -> r) inference, JPQL "select count(i) > 0", ReviewRepository join, V10 DO block, V9 and V12 CHECK constraints.
- Spring Data derived queries never accepted by a running app (existsByCategoryId, existsByNameIgnoreCaseAndIdNot, findByReviewReason...).
- StubInventoryClient approves everything. Stock is only reduced at payment time (PaymentService.deductStock). Until the Rust engine exists, two buyers can order the last item and OVERSOLD is only logged. The stock guard at order create is not atomic.
- Order price is frozen at order time. A sale that ends during the 10 minute hold still sells at the sale price.
- ProductSpecs price filters and price sorting use the regular price, not the sale price.
- A product named "Flash Sales" gets the slug flash-sales and clashes with /products/flash-sales.
- No average rating on the product list. No "can I review this" endpoint.
- Access token of a suspended user works until it expires (60 minutes).
- OrderPaidNotifier selects PAID orders without a notification, oldest first, LIMIT 50. 50 permanently failing orders would block newer ones (unlikely).
- Seeded vendor accounts (vendor1 to vendor3 @shopstream.local) share one password from SEED_VENDOR_PASSWORD. Demo data only. Never enable seed on a real production database.
- Dhaka is UTC+6. Dashboards use UTC days. A tz parameter is needed later.
- springdoc is in pom.xml but there is no OpenAPI config. README is 2 lines. src/test does not exist.
- The local .env may contain real values. Never share it. .gitignore covers .env, *.pem, target/, *.class.

## 11. Setup needed later (Phase 2)

JDK 21, Maven, Postgres (Docker is blocked, so Neon), Redis (Upstash), RSA key pair.
JWT keys: JwtConfig reads the private key as PKCS#8 (`-----BEGIN PRIVATE KEY-----`) and the public key as X.509 (`-----BEGIN PUBLIC KEY-----`). A key from `openssl genrsa` (PKCS#1, `BEGIN RSA PRIVATE KEY`) will fail at boot. Generate with `openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out private.pem` and `openssl rsa -pubout -in private.pem -out public.pem` (is openssl available on the owner's PC? verify kori-ni; Git for Windows usually ships it).
Env (from application.yml): DB_URL, DB_USER, DB_PASSWORD, JWT_PRIVATE_KEY_PATH, JWT_PUBLIC_KEY_PATH, ADMIN_EMAIL, ADMIN_PASSWORD, PAYMENT_MOCK_ENABLED, SSLCOMMERZ_ENABLED, SSLCOMMERZ_STORE_ID, SSLCOMMERZ_STORE_PASSWORD, SSLCOMMERZ_SANDBOX, INVENTORY_MODE, SEED_ENABLED, SEED_VENDOR_PASSWORD, CORS_ALLOWED_ORIGINS, APP_PUBLIC_URL, API_PUBLIC_URL, MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD, MAIL_FROM.
First run checklist: mvn compile, fix errors, boot with Neon, check Flyway applies V1 to V13, check Hibernate validate, run the seeder once, then run a mock payment end to end, then a sandbox refund.

## 12. Design system (for the frontend phase, not now)

Sora (headings) and Manrope (body). 60-30-10 color rule. Light: bg #FFFFFF, surface #F4F4F5, border #E4E4E7, text #18181B. Dark: bg #1A1A1A, surface #242424, border #333333, text #F4F4F5. Accent is flat lime, always with dark text. No gradients, no shadows, blur allowed (nav, dock, modal, toast, badge). Hugeicons, some animated, disabled under prefers-reduced-motion. 8pt grid, breakpoints 375, 768, 1024, 1440, touch targets 44px or more. Storefront: top pill nav. Vendor: tile sidebar and bottom dock. Dashboard: bento grid with flat solid charts.

---

## 13. What the next Claude should do first

1. Greet in Banglish, no long intro. List the pending decisions (section 9) once, do not block on them.
2. Ask the owner to upload a fresh zip of the repo (local fixes are not in the old snapshot). Reading it with tools is allowed. List the zip, extract to a scratch folder, never create deliverable files.
3. Review batch 2 (read first, then give full replacement files only where a real bug exists): ProductService, ReviewService, FulfillmentService, VendorService. Check imports, method names that other files call (grep for calls to methods that do not exist), constructor signatures, and property names. Those three kinds of error caused all 5 compile errors so far.
4. Then batch 3: AdminCatalogService, NotificationService, VendorStatsService, AdminReportService, AdminSeeder, SecurityConfig, and every controller and DTO record.
5. After each batch give PowerShell checks (rule 9) with expected output, and wait for the owner's output.
6. When all files are read, move to Phase 2 (setup, mvn compile, first boot).