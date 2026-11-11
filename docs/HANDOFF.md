# ShopStream: Handoff v5 (Java core-api focus)

Tumi amar project partner. Ami ekjon UI/UX designer, project-ta kora shikhchi. Amar shathe Banglish-e (Bangla kotha, English akkhore) kotha bolo. Tumi Java core-api complete korte amake help korbe.

## Kaj korar niyom (khub joruri)
1. Ami na bolle kono file banabe na, kono tool/command chalabe na. Shudhu chat-e code ar exact file path dibe, ami nijer PC-te VS Code-e paste korbo. (Ami jodi bole zip/file porte, tokhon pora jabe.)
2. Ek bare ekta chhoto step/code unit. Ami chalie output paste korbo, tarpor porer step.
3. Proti step-e: exact file path, kon command kothay (Windows PowerShell, CMD na), expected output.
4. File change hole full replace code dibe (ami puro file muchhe notun-ta boshai). Chhoto snippet dile exact kothay boshabo bolbe.
5. Kichu assume korbe na. Bhul hole bolbe. Free tier ba pricing deploy-er age current dekhe nite bolbe. Jinis verify na hole "verify kori-ni" bolbe.
6. Tumi code kokhono compile/run kore dekho-ni, ami-o kori-ni. Verified mane shudhu PowerShell output dekhiyechi.
7. CDO-level (strategic), decisive hobe. Kintu code-er kaj-e ami ja bolbo tai korbe.
8. Written content-e em dash dibe na.
9. Ami PowerShell output paste kori. Terminal line wrap hole file-e bhul ache dhorbe na.
10. Select-String case-insensitive ar import line-o dhore. Expected count dewar age pattern-ta comment, import, method naam, message string-e ache kina vabo. Output-e expected line na thakle sheta dhore felbe.
11. Migration file listing-e Get-ChildItem alphabetically sort kore (V10 boshe V1-er pore). Tai migration check-e number onujayi sort korbe: Get-ChildItem services/core-api/src/main/resources/db/migration | Sort-Object { [int](($_.Name -split '__')[0].Substring(1)) } | Select-Object -ExpandProperty Name

## Project
ShopStream: multi-vendor e-commerce, flash sale-e zero oversell, vendor live sales/stock dashboard. Portfolio, kintu production-grade. Repo: https://github.com/yasirabedrabbu/shopstream (branch main). Local: C:\Users\yasir\shopstream

## Tech stack
- apps/web: Next.js (App Router, TS), storefront + vendor/admin dashboard (khali)
- apps/widgets: SvelteKit live widgets (khali)
- services/core-api: Java 21 + Spring Boot 3.4.1 (Maven)
- services/inventory-engine: Rust (Axum + Tokio), atomic reserve, expiry, SSE (khali)
- Infra: Postgres 16, Redis 7 (Streams), Mailpit (docker-compose.yml)
- Auth: Java RS256 JWT issue kore, Rust/Svelte shudhu public key diye verify
- Checkout: Next.js -> Java order (PENDING) -> Java asks Rust reserve (10 min hold) -> payment -> Java PAID + event -> Rust finalize -> SSE push
- Seed: DummyJSON theke ekbar import, repo-te commit

## Amar PC
Windows 10, i3-7020U (2 core), 8GB RAM. Weak PC, ek shomoy ekta service. Docker install atke ache (WSL Ubuntu error 0x8000000d, Docker Desktop installer "can't run on your PC", mone hoy vul architecture, confirm kora baki). Plan B: Neon (Postgres) + Upstash (Redis). JDK 21, Maven, Rust, Node ekhono setup hoy-ni. Ami age Java code complete korbo, setup pore.

## Java core-api: ekhon ja ache
Path: services/core-api/src/main/java/com/shopstream/coreapi/ (package com.shopstream.coreapi). Packages: admin, auth, catalog, common, config, fulfillment, inventory, notification, order, payment, review, stats, user, vendor, web.

Migrations (services/core-api/src/main/resources/db/migration), V1 theke V10, shob file-e ache (V10 verified PowerShell-e): V1 users+vendors, V2 categories+products+product_images, V3 orders+order_items, V4 payments+payment_events, V5 shipping address (orders), V6 notifications, V7 flash sale columns (products), V8 reviews, V9 orders.paid_at (CHECK: PAID hole paid_at lagbe, purono PAID row backfill updated_at diye), V10 products.status-e BLOCKED (purono CHECK DO block diye drop, notun ck_products_status).

Endpoints:
- Public: GET /api/v1/ping, /products, /products/{slug}, /products/flash-sales, /categories, /stores/{slug}; GET /products/{slug}/reviews, /products/{slug}/reviews/summary; POST /auth/register, /auth/login
- Customer: GET /me; orders (POST, GET, GET/{id}, POST/{id}/cancel); POST /orders/{id}/pay; notifications (list, unread-count, read, read-all); reviews: POST /products/{slug}/reviews, PUT and DELETE /products/{slug}/reviews/mine
- POST /api/v1/orders body: { items: [{productId, quantity}], shippingAddress: {fullName, phone, line1, line2?, city, state?, postalCode, country (2-letter)} }
- Webhook: POST /payments/webhooks/{provider}; mock: POST /payments/mock/{ref}/confirm
- Vendor: /vendor/store (POST/GET/PUT), /vendor/products (CRUD), PUT and DELETE /vendor/products/{id}/flash-sale, /vendor/orders/items (GET, PATCH .../fulfillment), GET /vendor/reviews, GET /vendor/dashboard?period=7d|30d|all (default 30d)
- Admin: GET /admin/vendors, PATCH /admin/vendors/{id}/status, POST /admin/categories, PUT and DELETE /admin/categories/{id}, GET /admin/products?status&q, POST /admin/products/{id}/block and /unblock, GET /admin/users?role&status&q, PATCH /admin/users/{id}/status, GET /admin/orders?status, GET /admin/stats?period=7d|30d|all
Other: AdminSeeder, StubInventoryClient (stock enforce hoy na), MockPaymentGateway, OrderMaintenanceJobs (60s-e expired order cancel), OrderPaidNotifier (30s scheduler), EmailService (Mailpit), commission 10%, low-stock-threshold 5. OrderStatus: PENDING, AWAITING_PAYMENT, PAID, CANCELLED, EXPIRED. FulfillmentStatus: NEW, PACKED, SHIPPED, DELIVERED, CANCELLED. ProductStatus: DRAFT, ACTIVE, ARCHIVED, BLOCKED. Security: csrf off, stateless, CORS on, /admin/** ADMIN, /vendor/** VENDOR/ADMIN.

## Ei project-e ja hoyeche
Zip snapshot (ekbar upload kora) Step 5c porjonto, Step 1 theke 4 er age-r. Zip-e services/core-api/target/classes chhilo, shob .class Java 21 bytecode, VendorReview* shoho. Mane kono tool (VS Code Java extension ba mvn, kon-ta jani na) ekbar compile korechhilo. Eta mvn compile pass-er proman na.

Verified (PowerShell output dekhiyechi, shudhu file/pattern presence):
- 38-ta stray file core-api package-e git mv
- Shipping address, CORS, flash sale (DB + entity + API), effective price freeze + stock guard, reviews (DB, entity, API), vendor reviews list
- Step 1 (10-step plan): V9 paid_at + Order.java (paidAt field, markPaid() set kore, getPaidAt)
- Step 2: Vendor dashboard stats API, package stats: VendorDashboardResponse, VendorStatsRepository (NamedParameterJdbcTemplate, native SQL), VendorStatsService, VendorStatsController
- Step 3: Admin catalog: V10, ProductStatus.BLOCKED, ProductService full replace (vendor BLOCKED product edit/archive/flash-sale korte parbe na 403, nijer BLOCKED set korte parbe na 400), Category.rename, CategoryRepository.existsByNameIgnoreCaseAndIdNot, ProductRepository.existsByCategoryId, AdminCatalogService/Controller, AdminProductResponse
- Step 4: Admin users/orders/stats: UserRepository + JpaSpecificationExecutor, AdminUserResponse, UpdateUserStatusRequest, AdminUserService, AdminUserController, AdminOrderRow, PlatformStatsResponse, AdminReportRepository, AdminReportService, AdminReportController (shob admin package-e, 12-ta file)

## Decision (ami mene nilam)
Flash sale: per product sale price + start + end, tinta-i thakbe ba tinta-i nai (DB CHECK). sale < regular price API-te enforce. Sale max 30 din. Sale active compute hoy (start <= now < end), scheduler nai. Public response-e sale shudhu active thakle dekhay, saleEndsAt countdown-er jonno.
Reviews: shudhu DELIVERED item (PAID order) er customer review dite pare. Ek customer ek product-e ekta (UNIQUE, race hole 409). Rating 1 theke 5, comment optional max 2000. Reviewer naam DisplayNames.publicName. Nijer product-e review dite parbe na (403). Shudhu live (ACTIVE + approved store) product-e.
Revenue/GMV: shudhu PAID order-er item, CANCELLED item bad, tarikh orders.paid_at, bucket UTC, commission gross-er 10% (total theke ekbar, per-order rounding na).
Vendor dashboard: ek endpoint-e revenue, pipeline (shob PAID item, period-er upor nirbhor na), low-stock (ACTIVE, stock <= 5, max 20), top 5 product, daily calendar (7d/30d-te oi koyta din, all-te last 90 din, faka din zero), recent 10 item. Payout balance mane shudhu net earned (payout ledger nai, pore alada).
Admin: user suspend shudhu login bondho kore (store/product live thake). Nijeke ba onno ADMIN-ke suspend kora jay na. Category rename slug bodlay na. Category-te product thakle delete 409. Unblock korle product DRAFT hoy. Block-er reason save hoy na, vendor notification jay na.
Currency: "USD" hardcode (stats-e), mixed currency support nai.
10-step plan: 1 paid_at (done), 2 vendor stats (done), 3 admin catalog (done), 4 admin users/orders/stats (done), 5 payment gateway, 6 auth hardening (refresh, logout, login rate limit, password reset, email verify, ek step-e merge), 7 DummyJSON seed importer, 8 HttpInventoryClient + Redis Streams + SSE, 9 tests + OpenAPI (springdoc), 10 Dockerfile + prod profile + GitHub Actions + README + ei HANDOFF update.

## Known risks / ajana (kichu compile/run hoy-ni, shob "verify kori-ni")
- Java kokhono mvn compile/run kora hoy-ni (ami jani). Prothom compile-e chhoto error ashte pare.
- NamedParameterJdbcTemplate bean auto-configure hoy kina (spring-boot-starter-data-jpa spring-jdbc ane dhorchi).
- Stats ar admin report-er SQL real Postgres-e chalano hoy-ni: GROUP BY 1, ORDER BY alias, OFFSET :offset binding, SUM numeric ke getLong, rs.getObject UUID/OffsetDateTime/LocalDate.
- pgjdbc java.time.Instant direct nei na, tai OffsetDateTime bind kora hoyeche.
- V9 CHECK constraint ar V10 DO $$ block (Flyway + Postgres) kono DB-te chole-ni. V10 purono status CHECK sotti drop kore kina verify kori-ni.
- Spring Data derived query: existsByCategoryId (category.id), existsByNameIgnoreCaseAndIdNot boot-e accept kore kina.
- Specification lambda, PageResponse.of(result, r -> r) type inference, RowCallbackHandler lambda overload.
- Hibernate record @Embeddable (ShippingAddress), JPQL "select count(i) > 0", "join Product p on p.id = r.productId" (ReviewRepository), VendorService.getMine(ownerId) return Vendor (signature code-e dekha, compile na), Page<Object[]> projection.
- StubInventoryClient shob reserve approve kore. Stock shudhu payment-er shomoy komay (PaymentService.deductStock, markPaid-er shathe ek transaction). Rust engine na asha porjonto duijon last item order dite pare, OVERSOLD shudhu log hoy. Order create-er stock guard atomic na.
- Order price order-er shomoy freeze hoy. Sale 10 min hold-er moddhe sesh hole-o customer sale price-ei pay kore.
- ProductSpecs minPrice/maxPrice ar price_asc/price_desc sort regular price-e, sale price dhore na.
- Product naam "Flash Sales" dile slug flash-sales hoye /products/flash-sales-er shathe clash korbe. Reserved slug pore.
- Product list-e average rating nai (N+1). Dorkar hole products-e rating_count + rating_sum column.
- Customer-er jonno "ami review dite pari kina" endpoint nai.
- Suspend kora user-er agei deya JWT 60 min porjonto kaj kore (login bondho hoy, token na). Step 6-e fix.
- Category delete race: delete-er thik age notun product add hole FK error, GlobalExceptionHandler seta 409 kore kina dekhi-ni.
- Dhaka UTC+6, tai dashboard/stats-er din UTC bucket-e, bhor 6-tar age-r order ager UTC din-e jay. Pore tz parameter.
- Zip-er .env-e real value thakte pare (docker-er POSTGRES_*, REDIS_PORT, MAILPIT_* key), kothao share korbe na. .gitignore-e .env, *.pem, target/, *.class ache.
- README 2 line, src/test nai.

## Payment gateway: pending decision (Step 5-er age lagbe)
Ami Stripe primary dhorechhilam, kintu web search-e (third-party source, Stripe-er official page porini) paowa gelo: Bangladesh Stripe-er supported country list-e nai, Bangladesh-registered business Stripe account khulte pare na, ar account-er shathe jora manush-er residency supported country-te hote hobe. Shudhu test-mode key Bangladesh theke paowa jay kina verify kori-ni (dashboard.stripe.com/register-e country dropdown dekhe test kora jay).
Recommendation: SSLCOMMERZ primary (sandbox free registration, developer.sslcommerz.com/registration). PaymentProvider enum ar DB CHECK-e SSLCOMMERZ already ache, migration lagbe na. PaymentGateway interface ready.
SSLCOMMERZ ja jani (third-party library README theke, official doc porini): sandbox domain sandbox.sslcommerz.com; flow: session init (gwprocess/v4/api.php) -> GatewayPageURL -> success/fail/cancel/IPN callback -> val_id diye validation API (validator/api/validationserverAPI.php); refund-er jonno bank_tran_id lage. Duto ajana: sandbox-e USD cholbe kina (example BDT), ar IPN ekta public URL chay (localhost-e callback ashbe na, tunnel ba deploy lagbe; local dev-e MockPaymentGateway).
Option: A SSLCOMMERZ primary (recommended), B Stripe test mode (sign-up korte parle), C duto-i (tahole step 11-ta hobe). Ami ekhono uttor dei-ni.
Step 5-e refund scope-o decide hobe (admin refund endpoint, stock ferot).

## Java-te baki (ei order-e)
5. Payment gateway (upore decision) + webhook signature/validation + refund
6. Auth hardening: refresh token, logout, login rate limit, password reset, email verify, suspended user token fix
7. DummyJSON seed importer (seed.enabled property ache, seeder nai)
8. HttpInventoryClient (Rust-er por) + Redis Streams event + live SSE source
9. Tests + OpenAPI (springdoc)
10. Dockerfile + prod profile + GitHub Actions + README + HANDOFF update
Setup (pore): JDK 21, Maven, Postgres (Docker/Neon), Redis, RSA key pair (JWT_PRIVATE_KEY_PATH, JWT_PUBLIC_KEY_PATH), env: DB_PASSWORD, ADMIN_EMAIL, ADMIN_PASSWORD, PAYMENT_MOCK_ENABLED, SEED_*, CORS_ALLOWED_ORIGINS. Amar recommendation: Step 5 ba 6-er por JDK 21 + Maven + Neon setup kore mvn compile ar app boot, karon onek code ekshathe likhle runtime bug jome jay. Ami ekhon porjonto shob code age likhte chaichhi.

## Pending decision (ami ekhono bolini)
1. Payment gateway (upore A/B/C) 2. Accent color (lime #E8F44A?) 3. Dashboard storefront-er shathe ek Next.js app kina 4. AI bar: rule-based na free-tier LLM 5. Timeline 12-14 week

## Design system (frontend-er jonno, ekhon na)
Sora (heading) + Manrope (body). 60-30-10. Light: bg #FFFFFF, surface #F4F4F5, border #E4E4E7, text #18181B. Dark: bg #1A1A1A, surface #242424, border #333333, text #F4F4F5. Accent flat lime, shobsomoy dark text-er shathe. Gradient NAI, shadow NAI, blur ache (nav, dock, modal, toast, badge). Hugeicons, kichu animated, prefers-reduced-motion-e bondho. 8pt grid, breakpoints 375/768/1024/1440, touch 44px+. Storefront: top pill nav. Vendor: tile sidebar + bottom dock. Dashboard: bento grid, flat solid chart.

## Tumi prothome ja korbe
Amake Payment gateway decision (A, B ba C) jiggesh koro. Tarpor ei command-er output chaibe, jate migration V1 theke V10 thik order-e ache dekha jay:

cd C:\Users\yasir\shopstream
Get-ChildItem services/core-api/src/main/resources/db/migration | Sort-Object { [int](($_.Name -split '__')[0].Substring(1)) } | Select-Object -ExpandProperty Name

Expected: V1 theke V10 porjonto 10-ta file, number onujayi, shesh-e V10__add_blocked_product_status.sql. Tarpor Step 5 shuru koro, ek step ek step kore.