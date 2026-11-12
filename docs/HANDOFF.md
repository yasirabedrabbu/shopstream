# ShopStream: Handoff v8

Last updated: Phase 2 (setup and first run) mostly done. Backend boots against Neon, Flyway V1 to V13 applied, first vendor store created and approved. Next: categories, product, public listing, mock payment order.

Language for chat with the owner: Banglish. This document is English.

---

## 1. Working rules

1. Never create deliverable files with tools. Give full code in chat with the exact file path. Owner pastes into VS Code.
2. Never ask for, store, or echo secrets (passwords, tokens, connection strings, private keys). The owner runs commands locally and shares only results.
3. Every step includes the exact PowerShell command and the expected output.
4. When a file changes, give the full replacement file.
5. Do not assume. Say "verify kori-ni" when something is not confirmed.
6. "Compiles" means `mvn clean compile` passed. "Runs" means the app booted and an endpoint answered. Anything else is unverified.
7. No em dashes in written content.
8. PowerShell on this PC is Windows PowerShell 5. One command per code block. Use single quotes for patterns containing backslashes.
9. Select-String is case-insensitive and matches comments and imports too.

---

## 2. Project

ShopStream: multi-vendor e-commerce with zero-oversell flash sales and a live vendor dashboard. Portfolio project. Owner is a UI/UX designer learning backend by building it.

- Repo: https://github.com/yasirabedrabbu/shopstream (branch main)
- Local folder: C:\Users\yasir\shopstream
- Timeline: 12 to 14 weeks (not confirmed)

## 3. Tech stack and status

| Part | Tech | Status |
|---|---|---|
| services/core-api | Java 25 (pom says 25), Spring Boot 3.5.16, Maven 3.10.0 | Compiles (`mvn clean compile` BUILD SUCCESS). Boots. Endpoints tested. |
| services/inventory-engine | Rust (Axum, Tokio) | 10 files written. Never compiled. |
| apps/web | Next.js storefront and dashboards | Not started (folder does not exist) |
| apps/widgets | SvelteKit widgets | Not started (folder does not exist) |
| Database | Neon Postgres 16, Singapore (ap-southeast-1) | Live. Flyway V1 to V13 applied. |
| Redis | Upstash (planned) | Not set up |
| Docker | docker-compose.yml exists | Not used. Docker install blocked on owner PC. |

Auth: core-api issues RS256 JWT. Rust and Svelte only verify with the public key.

Checkout flow (design): Next.js creates Java order (PENDING). Java asks Rust to reserve stock (10 minute hold). Payment. Java marks order PAID and emits event. Rust finalizes reservation and pushes SSE.

---

## 4. Owner's PC

Windows 10, i3-7020U, 8GB RAM. Run one service at a time.

Installed:
- JDK: Temurin 25.0.5 (`java -version` OK)
- Maven 3.10.0 at `C:\Program Files\apache-maven-3.10.0`
- OpenSSL via Git for Windows at `C:\Program Files\Git\usr\bin\openssl.exe`

Maven PATH problem: `mvn` is not recognised in new PowerShell windows, even though Machine PATH contains the bin folder. Workaround in use:
- Per session: `Set-Alias mvn "C:\Program Files\apache-maven-3.10.0\bin\mvn.cmd"`
- Or the full path: `& "C:\Program Files\apache-maven-3.10.0\bin\mvn.cmd" <args>`
- Root cause not confirmed. Check later whether Machine PATH has duplicate or broken entries (the Machine PATH length is 487 characters).

Not installed: Rust, Node.js.

---

## 5. Phase plan

| Phase | Content | Status |
|---|---|---|
| 1. Finish Java | Payments, reviews, refunds, auth, seeder | Code complete. Reviewed by reading. |
| 2. Setup and first run | JDK, Maven, Neon, RSA keys, env, compile, boot, Flyway, first API calls | Mostly done (see section 7) |
| 3. Inventory engine | Rust reserve/finalize/release/SSE/JWT, Java HttpInventoryClient, Redis Streams | Rust written, not compiled. Java side not started. |
| 4. Quality and packaging | Tests, OpenAPI config, Dockerfile, prod profile, GitHub Actions, README | Not started |
| 5. Frontend | Next.js storefront and dashboards, SvelteKit widgets | Not started |
| 6. Deploy | Hosting, secrets, domain, SSLCOMMERZ live | Not started |

---

## 6. Java core-api

Path: `services/core-api/src/main/java/com/shopstream/coreapi/` (130 files, all reviewed by reading).

Migrations: V1 to V13 in `src/main/resources/db/migration`. Applied to Neon on first boot.

Key endpoints:
- Public: `/api/v1/ping`, `/products`, `/products/{slug}`, `/products/flash-sales`, `/categories`, `/stores/{slug}`, reviews
- Auth: `/auth/register`, `/login`, `/refresh`, `/logout`, `/password-reset/request`, `/password-reset/confirm`
- Customer: `/me`, `/orders` (POST, GET, GET/{id}, POST/{id}/cancel), `/orders/{id}/pay`, notifications, reviews
- Payment: `/payments/webhooks/{provider}`, `/payments/mock/{ref}/confirm?success=true` (dev only), `/payments/sslcommerz/*`
- Vendor: `/vendor/store`, `/vendor/products` (CRUD, flash-sale), `/vendor/orders/items`, `/vendor/reviews`, `/vendor/dashboard?period=7d|30d|all`
- Admin: `/admin/vendors` (list, PATCH status), `/admin/categories` (POST, PUT, DELETE), `/admin/products` (block, unblock), `/admin/users`, `/admin/orders`, `/admin/stats`, `/admin/payments/review`, `/admin/payments/{id}/refund`

Enums: OrderStatus (PENDING, AWAITING_PAYMENT, PAID, CANCELLED, EXPIRED), FulfillmentStatus (NEW, PACKED, SHIPPED, DELIVERED, CANCELLED), ProductStatus (DRAFT, ACTIVE, ARCHIVED, BLOCKED), VendorStatus (PENDING, APPROVED, ...), PaymentStatus (PENDING, SUCCEEDED, FAILED), PaymentReviewReason (HELD, LATE_PAYMENT, AMOUNT_MISMATCH, DUPLICATE_CHARGE).

Config: `application.yml` reads env vars. Spring Boot does NOT read `.env` automatically. Variables must be loaded into the PowerShell session (see section 8).

Known behaviour of current boot:
- `StubInventoryClient` logs a warning: stock is NOT enforced.
- `AdminSeeder` created the admin user on first boot (role ADMIN). It only creates, never updates.
- `DummyJsonSeeder` disabled (`SEED_ENABLED=false`).
- SpringDoc Swagger UI is enabled by default (fine for dev, disable for prod).
- `LoginRateLimitFilter` is `@Component`, auto-registered. Limit 10 per minute per IP.

---

## 7. Phase 2 progress (what has been verified by pasted output)

| Step | Result |
|---|---|
| `java -version` | Temurin 25.0.5 |
| `mvn -version` (full path) | Maven 3.10.0 |
| `mvn clean compile` | BUILD SUCCESS, 130 files, release 25 |
| Neon connection | PostgreSQL 16.15, connected |
| Flyway | Successfully applied 13 migrations, schema v13 |
| Hibernate validate | Passed (app booted) |
| JWT keys | Loaded from `services/core-api/keys/` (PKCS#8) |
| Boot | Started on port 8080 |
| `GET /api/v1/ping` | `status: ok` |
| `POST /auth/login` (admin) | Returns tokens, role ADMIN |
| `POST /auth/register` (vendor1) | Returns user, role CUSTOMER |
| Role change | Done via Neon SQL editor (`UPDATE users SET role='VENDOR' ...`) |
| `POST /vendor/store` | Created, slug `test-store`, status PENDING |
| `PATCH /admin/vendors/{id}/status` | APPROVED |
| `GET /categories` | Returned nothing printed (empty list or no output, verify) |

Open issue (not explained):
- The first `POST /vendor/store` returned success, but the `vendors` table had 0 rows afterwards. Entity mapping (`@Table(name="vendors")`, `@Column`s) matches migrations. The second store create persisted correctly. Root cause unknown. If it happens again, check the Spring log for the INSERT and any rollback.

Open issue: `GET /admin/vendors` returned `totalElements: 0` while a vendor row existed in the DB at that time. Re-check after the store is approved. If the list is still empty, check the `AdminVendorController` query path.

---

## 8. Local environment (never commit)

`.env` file at project root (in `.gitignore`). Contains:
- `DB_URL`, `DB_USER`, `DB_PASSWORD` (Neon, jdbc format with `sslmode=require&channelBinding=require`)
- `JWT_PRIVATE_KEY_PATH=keys/private.pem`, `JWT_PUBLIC_KEY_PATH=keys/public.pem` (relative to services/core-api)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- `PAYMENT_MOCK_ENABLED=true`, `SSLCOMMERZ_ENABLED=false`, `SEED_ENABLED=false`, `INVENTORY_MODE=stub`
- `CORS_ALLOWED_ORIGINS=http://localhost:3000`, `APP_PUBLIC_URL=http://localhost:3000`, `API_PUBLIC_URL=http://localhost:8080`

Keys: `services/core-api/keys/private.pem` and `public.pem`, generated with OpenSSL `genpkey` (PKCS#8). Folder is covered by `*.pem` in `.gitignore`.

Load env vars into the current session (after every new PowerShell window):

```powershell
Get-Content C:\Users\yasir\shopstream\.env | Where-Object { $_ -match '^\s*[^#].*=' } | ForEach-Object {
  $k, $v = $_ -split '=', 2
  [Environment]::SetEnvironmentVariable($k.Trim(), $v.Trim(), 'Process')
}
```

Start the app (from `services\core-api`):

```powershell
& "C:\Program Files\apache-maven-3.10.0\bin\mvn.cmd" spring-boot:run
```

Sensitive data handling:
- Passwords and tokens were pasted into chat several times in this project (Gmail, Neon, admin, test vendor, access and refresh tokens). Treat all of them as exposed. Rotate the Neon password and Gmail password. Log out the test refresh tokens. Do not paste any secret again.
- Test account `vendor1@test.local` has a throwaway password pasted in chat. Use a new password for any real use.

---

## 9. Next steps

1. Create a category (admin token). Category list was empty. Example:

```powershell
$admin = Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/v1/auth/login -ContentType 'application/json' -Body '{"email":"<admin email>","password":"<admin password>"}'
$adminHeaders = @{ Authorization = "Bearer $($admin.accessToken)" }
Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/v1/admin/categories -Headers $adminHeaders -ContentType 'application/json' -Body '{"name":"Electronics"}'
```

2. Confirm `GET /api/v1/categories` shows the category.
3. Create a product as vendor (store is APPROVED): `POST /api/v1/vendor/products` with name, priceCents, currency, stockQuantity, categoryId, status ACTIVE, optional imageUrls.
4. Confirm `GET /api/v1/products` lists the product.
5. Register a customer account, get token, create order (`POST /api/v1/orders`), then mock pay (`POST /api/v1/payments/orders/{orderId}/pay` with provider MOCK, then `/payments/mock/{providerReference}/confirm`).
6. Check `GET /admin/vendors` again.
7. Check Spring log for each step. Paste only errors and key result lines, never tokens.

Then:
- Git: check `git status`. Commit `PasswordResetTokenRepository.java` filename (snapshot had `.jav`). Confirm the local fixes from session 1 are committed.
- Rust: `cargo build` in `services/inventory-engine` (needs Rust installed).
- Phase 3 decision: how Java calls Rust (HttpInventoryClient) before Redis Streams.

---

## 10. Pending decisions (owner has not answered)

1. Payment: SSLCOMMERZ primary (A), Stripe test mode (B), or both (C).
2. Accent color (lime #E8F44A?).
3. Dashboard inside the storefront Next.js app or separate.
4. AI bar: rule-based or free-tier LLM.
5. Timeline: 12 to 14 weeks.
6. Demo currency: USD (needs SSLCOMMERZ multi-currency, unverified) or BDT.
7. Email verify: add later or never.

---

## 11. Known risks (verify kori-ni)

- Inventory: stub approves everything. Two buyers can oversell until Rust engine exists. Stock is reduced only at payment time.
- SSLCOMMERZ refund endpoint and USD support unverified against official docs.
- Refund with cancelOrder=false leaves the order PAID, so revenue still counts it.
- Gateway refund succeeds but DB commit fails: money returned but DB unaware. Needs outbox later.
- Raw SQL (stats, admin reports) and JPQL `select count(i) > 0` never run on Postgres in a test. Verify when the dashboard is called.
- Access token of a suspended user works until expiry (60 minutes).
- Order price frozen at order time. Sale ending during the 10 minute hold still sells at sale price.
- ProductSpecs price filters use regular price, not sale price.
- A product named "Flash Sales" clashes with `/products/flash-sales`.
- Timezone: dashboards use UTC days. Dhaka is UTC+6.
- Seeded vendor accounts share one password. Never enable seed on a real database.
- No tests (`src/test` does not exist). No OpenAPI config class. README is 2 lines.
- `.env` may hold real values. Never share it.

---

## 12. Design system (for frontend phase)

Sora (headings) and Manrope (body). 60-30-10 colour rule. Light: bg #FFFFFF, surface #F4F4F5, border #E4E4E7, text #18181B. Dark: bg #1A1A1A, surface #242424, border #333333, text #F4F4F5. Accent flat lime with dark text. No gradients, no shadows. Blur allowed on nav, dock, modal, toast, badge. Hugeicons, disabled under prefers-reduced-motion. 8pt grid. Breakpoints 375, 768, 1024, 1440. Touch targets 44px or more. Storefront: top pill nav. Vendor: tile sidebar and bottom dock. Dashboard: bento grid with flat solid charts.

---

## 13. What the next session should do first

1. Greet in Banglish, short. Ask what the owner has run since the last handoff.
2. Ask whether `GET /api/v1/categories` returned any category. If empty, do step 9.1.
3. Continue section 9 in order. Give one step at a time with expected output.
4. Do not start frontend (apps/web) until product, order, and mock payment are verified.