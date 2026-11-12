# ShopStream: Handoff v6

Last updated: Step 5.4 done, Step 5.5 is next.
Language for chat with the owner: Banglish (Bangla words in English letters). This document is English.

---

## 1. Working rules (strict, follow every time)

1. Do not create files and do not run tools or commands unless the owner asks. Give code in chat with the exact file path. The owner pastes it into VS Code. (If the owner says to read a zip or file, reading is allowed.)
2. One small step or one code unit at a time. The owner runs it, pastes the PowerShell output, then the next step.
3. Every step includes: exact file path, which command to run and where (Windows PowerShell, never CMD), and the expected output.
4. When a file changes, give the full replacement file (the owner deletes the old content and pastes the new one). For a tiny snippet, say exactly where it goes. Give code in its final form so it is not rewritten in a later step.
5. Do not assume. If something is wrong, say so. Before deploy, ask the owner to check current free tiers and pricing. If something is not verified, say "verify kori-ni".
6. The code has never been compiled or run by Claude or the owner. "Verified" only means the owner pasted PowerShell output proving a file or pattern exists.
7. Be strategic and decisive (CDO level), but in code tasks do what the owner says.
8. No em dashes in written content.
9. The owner pastes PowerShell output. A wrapped terminal line does not mean a bug in the file.
10. Select-String is case-insensitive and also matches import lines. Before stating an expected count, check whether the pattern also appears in a comment, an import, a method name or a message string. If the expected line is missing from the output, treat it as a failure.
11. Migration listing sorts alphabetically (V10 appears after V1). Always sort numerically:
    `Get-ChildItem services/core-api/src/main/resources/db/migration | Sort-Object { [int](($_.Name -split '__')[0].Substring(1)) } | Select-Object -ExpandProperty Name`
12. Line numbers in "expected output" can be off by a few lines. What matters is that the expected lines exist.

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
| services/core-api | Java 25, Spring Boot 3.5.16, Maven | in progress |
| services/inventory-engine | Rust (Axum, Tokio): atomic reserve, expiry, SSE | empty |
| Infra | Postgres 16, Redis 7 (Streams), Mailpit (docker-compose.yml) | not running yet |

Auth: Java issues RS256 JWT. Rust and Svelte only verify with the public key.

Checkout flow: Next.js creates a Java order (PENDING). Java asks Rust to reserve stock (10 minute hold). Payment happens. Java marks the order PAID and emits an event. Rust finalizes the reservation and pushes SSE.

Seed data: one-time import from DummyJSON, committed to the repo.

## 4. Owner's PC

Windows 10, i3-7020U (2 cores), 8GB RAM. Run one service at a time. Docker install is blocked (WSL Ubuntu error 0x8000000d, Docker Desktop installer says it cannot run on this PC, probably wrong architecture, not confirmed). Plan B: Neon (Postgres) and Upstash (Redis). JDK 25, Maven, Rust and Node are not set up yet. Setup is planned after the Java code is complete.

---

## 5. Phase plan (about 150 units, grouped into 6 phases)

| Phase | Content | Units (estimate) |
|---|---|---|
| 1. Finish Java | Step 5 (payment, review, refund), Step 6 (auth hardening), Step 7 (seed) | 25 to 30 |
| 2. Setup and first run | JDK, Maven, Neon, RSA keys, env, mvn compile, app boot, SQL bug fixes | 10 to 15 |
| 3. Inventory engine | Rust (reserve, expiry, finalize, SSE, JWT) and Java Step 8 (HttpInventoryClient, Redis Streams) | 20 to 25 |
| 4. Quality and packaging | Tests, OpenAPI, Dockerfile, prod profile, GitHub Actions, README, HANDOFF | 18 to 22 |
| 5. Frontend | Design system, Next.js (storefront, checkout, vendor, admin), Svelte widgets | 65 to 80 |
| 6. Deploy | Hosting, secrets, domain, SSLCOMMERZ live, final check | 10 to 15 |

The "one small unit at a time" rule applies inside every phase.

## 6. Java core-api: current state

Path: `services/core-api/src/main/java/com/shopstream/coreapi/` (package `com.shopstream.coreapi`).
Packages: admin, auth, catalog, common, config, fulfillment, inventory, notification, order, payment, review, stats, user, vendor, web.

### Migrations (`services/core-api/src/main/resources/db/migration`), V1 to V12

V1 users and vendors, V2 categories, products, product_images, V3 orders and order_items, V4 payments and payment_events, V5 shipping address on orders, V6 notifications, V7 flash sale columns on products, V8 reviews, V9 orders.paid_at, V10 BLOCKED product status, V11 payments.bank_tran_id and val_id, V12 payment review and refund columns (review_reason, review_at, review_resolved_at, refunded_at, refund_ref, two CHECK constraints, partial index ix_payments_review_open).

Note: V11 and V12 were found in the zip snapshot. Their presence is confirmed by file listing only. Not run on any database.

### Endpoints

- Public: GET /api/v1/ping, /products, /products/{slug}, /products/flash-sales, /categories, /stores/{slug}, /products/{slug}/reviews, /products/{slug}/reviews/summary. POST /auth/register, /auth/login.
- Customer: GET /me. Orders: POST, GET, GET/{id}, POST/{id}/cancel. POST /orders/{id}/pay. Notifications: list, unread-count, read, read-all. Reviews: POST /products/{slug}/reviews, PUT and DELETE /products/{slug}/reviews/mine.
- POST /api/v1/orders body: `{ items: [{productId, quantity}], shippingAddress: {fullName, phone, line1, line2?, city, state?, postalCode, country (2-letter)} }`
- Payment: POST /payments/webhooks/{provider}. Mock: POST /payments/mock/{ref}/confirm. SSLCOMMERZ browser return: /api/v1/payments/sslcommerz/success, /fail, /cancel (GET and POST, public).
- Vendor: /vendor/store (POST, GET, PUT), /vendor/products (CRUD), PUT and DELETE /vendor/products/{id}/flash-sale, /vendor/orders/items (GET, PATCH .../fulfillment), GET /vendor/reviews, GET /vendor/dashboard?period=7d|30d|all.
- Admin: GET /admin/vendors, PATCH /admin/vendors/{id}/status, POST /admin/categories, PUT and DELETE /admin/categories/{id}, GET /admin/products?status&q, POST /admin/products/{id}/block and /unblock, GET /admin/users?role&status&q, PATCH /admin/users/{id}/status, GET /admin/orders?status, GET /admin/stats?period=7d|30d|all.

### Other

AdminSeeder, StubInventoryClient (stock not enforced), MockPaymentGateway, SslCommerzGateway, OrderMaintenanceJobs (cancels expired orders every 60s), OrderPaidNotifier (30s scheduler), EmailService (Mailpit). Commission 10%, low-stock threshold 5.
Enums: OrderStatus (PENDING, AWAITING_PAYMENT, PAID, CANCELLED, EXPIRED), FulfillmentStatus (NEW, PACKED, SHIPPED, DELIVERED, CANCELLED), ProductStatus (DRAFT, ACTIVE, ARCHIVED, BLOCKED), PaymentReviewReason (HELD, LATE_PAYMENT, AMOUNT_MISMATCH, DUPLICATE_CHARGE).
Security: CSRF off, stateless, CORS on, /admin/** needs ADMIN, /vendor/** needs VENDOR or ADMIN. New admin endpoints are covered automatically.

---

## 7. Work log

### Done and verified (owner pasted PowerShell output, file or pattern presence only)

- 38 stray files moved into the core-api package with git mv.
- Shipping address, CORS, flash sale (DB, entity, API), effective price freeze and stock guard, reviews (DB, entity, API), vendor reviews list.
- Step 1: V9 paid_at and Order.paidAt, markPaid() sets it.
- Step 2: Vendor dashboard stats API (package stats).
- Step 3: Admin catalog (V10, BLOCKED status, category management, product block/unblock).
- Step 4: Admin users, orders and platform stats (12 files in admin package).

### Step 5: payment gateway, review, refund (in progress)

Found in the zip snapshot, not read in detail and not verified: SslCommerzGateway (290 lines), SslCommerzCallbackController, V11, V12, and the review/refund methods on Payment (requestReview, resolveReview, markRefunded, getters).

Done in this session (each verified by PowerShell pattern output):

| Unit | File | Result |
|---|---|---|
| 5.1 | payment/PaymentService.java (full replace) | handleEvent now calls payment.requestReview for HELD, AMOUNT_MISMATCH, DUPLICATE_CHARGE, LATE_PAYMENT. 4 matches found, setRollbackOnly count 0. |
| 5.2 | payment/PaymentRepository.java (full replace) | Added findByReviewReasonIsNotNullAndReviewResolvedAtIsNull(Pageable) and findByReviewReasonAndReviewResolvedAtIsNull(reason, Pageable). Both found. |
| 5.3 | admin/AdminPaymentReviewResponse.java (new) | Record with from(Payment). Found. |
| 5.4 | admin/AdminPaymentReviewService.java (new) | list(reason, pageable), read-only transaction. Found. |

Behavior decisions applied in 5.1:
- HELD: payment stays PENDING, review record written, event row is committed (no rollback). A repeat of the same event id is ignored. The review list is the way to handle it.
- AMOUNT_MISMATCH: payment is marked SUCCEEDED (money was taken, and markRefunded needs SUCCEEDED), bank details saved, order NOT marked paid, review record written.
- DUPLICATE_CHARGE: order already PAID by another payment, review record written.
- LATE_PAYMENT: payment succeeded but order is CANCELLED or EXPIRED, review record written.
- Payment.requestReview keeps the first reason if a review is already open.

### Next units (proposed order)

| Unit | Task |
|---|---|
| 5.5 | admin/AdminPaymentReviewController: GET /api/v1/admin/payments/review?reason=HELD&page=0&size=20 (same Pageable pattern as AdminUserController, sort by reviewAt) |
| 5.6 | Resolve review endpoint (admin marks a review resolved, uses Payment.resolveReview) |
| 5.7 | Refund: add a refund method to PaymentGateway, implement in SslCommerzGateway and MockPaymentGateway |
| 5.8 | Admin refund endpoint, refund scope decision (stock return, order status, HELD payments need a relaxed markRefunded rule) |
| 5.9 | Read and verify SslCommerzGateway (signature, validation API, amount unit, currency) |

### Remaining Java steps

6. Auth hardening: refresh token, logout, login rate limit, password reset, email verify, fix suspended user token still valid for up to 60 minutes. One merged step.
7. DummyJSON seed importer (`app.seed.enabled` property exists, no seeder yet).
8. HttpInventoryClient (after the Rust engine), Redis Streams event, live SSE source. (Phase 3.)
9. Tests and OpenAPI (springdoc). (Phase 4.)
10. Dockerfile, prod profile, GitHub Actions, README, HANDOFF update. (Phase 4.)

---

## 8. Decisions already made

- Flash sale: sale price, start and end are all set or all null (DB CHECK). Sale price must be below regular price (API). Max 30 days. "Active" is computed (start <= now < end), no scheduler. Public response shows the sale only while active, plus saleEndsAt for a countdown.
- Reviews: only a customer with a DELIVERED item in a PAID order can review. One review per customer per product (UNIQUE, race gives 409). Rating 1 to 5, comment optional, max 2000. Reviewer name uses DisplayNames.publicName. A vendor cannot review own product (403). Only live products (ACTIVE and approved store).
- Revenue and GMV: only PAID orders, CANCELLED items excluded, date from orders.paid_at, UTC buckets, commission is 10% of gross (computed once from the total, no per-order rounding).
- Vendor dashboard: one endpoint with revenue, pipeline, low stock (ACTIVE, stock <= 5, max 20), top 5 products, daily calendar (7d and 30d, all = last 90 days, empty days are zero), recent 10 items. Payout balance means net earned only (no payout ledger yet).
- Admin: user suspend only blocks login (store and products stay live). Admin cannot suspend self or another ADMIN. Category rename keeps the slug. Deleting a category that has products returns 409. Unblock sets the product to DRAFT. Block reason is not saved and the vendor is not notified.
- Currency: "USD" is hardcoded in stats. No mixed currency support.
- Payment: SSLCOMMERZ is the primary gateway (code exists in the repo). The owner has not confirmed this in writing in the latest chats, so confirm once. Stripe is not available for Bangladesh-registered businesses (third-party source, official page not read, verify kori-ni). Local development uses MockPaymentGateway.

## 9. Pending decisions (owner has not answered)

1. Confirm SSLCOMMERZ as primary (option A), or add Stripe test mode (B), or both (C).
2. Accent color (lime #E8F44A?).
3. Dashboard inside the storefront Next.js app or separate.
4. AI bar: rule-based or free-tier LLM.
5. Timeline: 12 to 14 weeks.
6. Refund scope in Step 5.8 (stock return, HELD payments).

## 10. Known risks and unknowns (nothing has been compiled or run, all "verify kori-ni")

- Java has never run through mvn compile or app boot. Expect small errors on the first compile.
- NamedParameterJdbcTemplate bean auto-configuration (assumed from spring-boot-starter-data-jpa).
- Stats and admin report SQL never ran on real Postgres: GROUP BY 1, ORDER BY alias, OFFSET :offset binding, SUM numeric read with getLong, rs.getObject for UUID, OffsetDateTime, LocalDate.
- pgjdbc has no direct java.time.Instant binding, so OffsetDateTime is bound.
- V9 CHECK constraint, V10 DO $$ block, V11 and V12 never ran on any database. V10 dropping the old status CHECK is unconfirmed. V12 CHECK constraints and partial index are unconfirmed.
- Spring Data derived queries not yet accepted by a running app: existsByCategoryId, existsByNameIgnoreCaseAndIdNot, findByReviewReasonIsNotNullAndReviewResolvedAtIsNull, findByReviewReasonAndReviewResolvedAtIsNull.
- Specification lambdas, PageResponse.of(result, r -> r) type inference, RowCallbackHandler lambda overload, Hibernate record @Embeddable (ShippingAddress), JPQL "select count(i) > 0", the Product join in ReviewRepository, Page<Object[]> projection.
- StubInventoryClient approves every reserve. Stock is only reduced at payment time (PaymentService.deductStock, same transaction as markPaid). Until the Rust engine exists, two buyers can order the last item and OVERSOLD is only logged. The stock guard on order create is not atomic.
- Order price is frozen at order time. A sale that ends during the 10 minute hold still sells at the sale price.
- ProductSpecs min/max price filters and price_asc/price_desc sort use the regular price, not the sale price.
- A product named "Flash Sales" gets slug flash-sales and clashes with /products/flash-sales. Reserved slugs are not handled yet.
- No average rating on the product list (N+1 risk). Needs rating_count and rating_sum columns if required.
- No endpoint for "can I review this product" for customers.
- A suspended user's existing JWT works for up to 60 minutes (fix in Step 6).
- Category delete race: FK error may not map to 409 in GlobalExceptionHandler, not checked.
- Dhaka is UTC+6. Dashboard and stats use UTC days, so orders before 6am Dhaka land on the previous day. A tz parameter is needed later.
- HELD payments stay PENDING, so Payment.markRefunded (needs SUCCEEDED) will reject them until the refund scope is decided.
- HELD event rows are committed, so a later notification with the same event id is ignored.
- SslCommerzGateway and its callback flow are not read in detail. Open questions: does the sandbox accept USD (examples use BDT), IPN needs a public URL (localhost will not receive it, use a tunnel or deploy, Mock for local dev), and the unit of amountCents versus the gateway amount.
- The local .env may contain real values. Never share it. .gitignore covers .env, *.pem, target/, *.class.
- README is 2 lines. src/test does not exist.

## 11. Setup needed later (Phase 2)

JDK 21, Maven, Postgres (Docker or Neon), Redis (Upstash), RSA key pair (JWT_PRIVATE_KEY_PATH, JWT_PUBLIC_KEY_PATH).
Env: DB_URL, DB_USER, DB_PASSWORD, ADMIN_EMAIL, ADMIN_PASSWORD, PAYMENT_MOCK_ENABLED, SSLCOMMERZ_ENABLED, SSLCOMMERZ_STORE_ID, SSLCOMMERZ_STORE_PASSWORD, SSLCOMMERZ_SANDBOX, INVENTORY_MODE, SEED_ENABLED, SEED_VENDOR_PASSWORD, CORS_ALLOWED_ORIGINS, APP_PUBLIC_URL, API_PUBLIC_URL, MAIL_*.
Recommendation: after Step 5 or 6, set up JDK 25, Maven and Neon, run mvn compile and boot the app, because runtime bugs pile up when a lot of code is written first. The owner currently prefers to write all Java code first.

## 12. Design system (for the frontend phase, not now)

Sora (headings) and Manrope (body). 60-30-10 color rule. Light: bg #FFFFFF, surface #F4F4F5, border #E4E4E7, text #18181B. Dark: bg #1A1A1A, surface #242424, border #333333, text #F4F4F5. Accent is flat lime, always with dark text. No gradients, no shadows, blur allowed (nav, dock, modal, toast, badge). Hugeicons, some animated, disabled under prefers-reduced-motion. 8pt grid, breakpoints 375, 768, 1024, 1440, touch targets 44px or more. Storefront: top pill nav. Vendor: tile sidebar and bottom dock. Dashboard: bento grid with flat solid charts.

---

## 13. What the next Claude should do first

1. Greet in Banglish, no long intro. Do not ask for the payment gateway decision again as the first thing, only list it under pending decisions.
2. Start with Step 5.5: full new file `services/core-api/src/main/java/com/shopstream/coreapi/admin/AdminPaymentReviewController.java`, following the AdminUserController pattern (Pageable with Math.max/Math.min, Sort.by("reviewAt").descending(), PageResponse.of(result, r -> r)), endpoint GET /api/v1/admin/payments/review with optional reason, page, size.
3. Give the PowerShell Select-String check with expected output, then wait for the owner's output before Step 5.6.