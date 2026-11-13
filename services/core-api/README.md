# core-api

Spring Boot 3.5 REST API for ShopStream. Java 25. PostgreSQL via Flyway migrations.

## Requirements

- JDK 25 (Temurin recommended)
- Maven 3.10 or newer
- PostgreSQL 16 (Neon or local Docker)

## Setup

1. Generate RSA keys (PKCS#8) in `services/core-api/keys/`:

   ```powershell
   cd services\core-api
   New-Item -ItemType Directory -Force keys
   & "C:\Program Files\Git\usr\bin\openssl.exe" genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out keys\private.pem
   & "C:\Program Files\Git\usr\bin\openssl.exe" rsa -in keys\private.pem -pubout -out keys\public.pem
   ```

   The `keys` folder is ignored by git. Never commit these files.

2. Create `services/core-api/.env` from `.env.example` (in this folder) and fill in your values.

3. Load the variables into your PowerShell session before each run:

   ```powershell
   Get-Content .env | Where-Object { $_ -match '^\s*[^#].*=' } | ForEach-Object {
     $k, $v = $_ -split '=', 2
     [Environment]::SetEnvironmentVariable($k.Trim(), $v.Trim(), 'Process')
   }
   ```

   Spring Boot does not read `.env` by itself.

4. Run:

   ```powershell
   & "C:\Program Files\apache-maven-3.10.0\bin\mvn.cmd" spring-boot:run
   ```

5. Check: `http://localhost:8080/api/v1/ping` returns `status: ok`.

## Configuration

| Variable | Purpose | Example |
|---|---|---|
| `DB_URL` | JDBC URL | `jdbc:postgresql://<host>/<db>?sslmode=require` |
| `DB_USER` | Database user | |
| `DB_PASSWORD` | Database password | |
| `JWT_PRIVATE_KEY_PATH` | Signing key | `keys/private.pem` |
| `JWT_PUBLIC_KEY_PATH` | Verification key | `keys/public.pem` |
| `ADMIN_EMAIL` | Seeded admin login | |
| `ADMIN_PASSWORD` | Seeded admin password | |
| `PAYMENT_MOCK_ENABLED` | Enables mock payments | `true` (dev only) |
| `SSLCOMMERZ_ENABLED` | Enables SSLCOMMERZ | `false` |
| `SEED_ENABLED` | Enables demo data seeder | `false` |
| `INVENTORY_MODE` | `stub` or `http` | `stub` |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origins | `http://localhost:3000` |
| `APP_PUBLIC_URL` | Frontend base URL | `http://localhost:3000` |
| `API_PUBLIC_URL` | Backend base URL | `http://localhost:8080` |

## Project layout

src/main/java/com/shopstream/coreapi/
admin/ Admin catalog, users, payments, reports
auth/ Register, login, refresh, logout, password reset
catalog/ Products, categories, flash sales
common/ PageResponse, ApiException, shared helpers
fulfillment/ Vendor order items and status changes
order/ Orders, shipping address, cancel
payment/ Mock and SSLCOMMERZ payments, webhooks, refunds
review/ Product reviews
stats/ Vendor dashboard and platform stats
vendor/ Vendor store, admin vendor approval
web/ Ping and current user


## Notes

- Flyway runs on startup. Migrations V1 to V13 are applied.
- `AdminSeeder` creates the admin user on first boot only.
- `StubInventoryClient` does not enforce stock until the Rust engine is connected.
- Swagger UI is enabled in development. Disable it for production.
- Tests are not written yet.