# ShopStream

Multi-vendor e-commerce platform with zero-oversell flash sales and a live vendor dashboard.

ShopStream is a portfolio project. Vendors open stores, list products, run timed flash sales, and track sales in real time. Customers browse, order, and pay. Admins approve vendors, moderate products, and review payments.

## Status

- Backend API (core-api): running against Postgres. Auth, catalog, orders, mock payments, vendor and admin endpoints are in place.
- Inventory engine (Rust): written, not yet compiled. Stock is not enforced yet.
- Storefront and dashboards (Next.js): written. Under testing.
- Widgets (SvelteKit): not started.

## Stack

| Part | Technology |
|---|---|
| Core API | Java 25, Spring Boot 3.5, Flyway, PostgreSQL |
| Inventory engine | Rust, Axum, Tokio (planned: Redis Streams) |
| Storefront and dashboards | Next.js 16, React 19, Tailwind CSS 4, TypeScript |
| Widgets | SvelteKit (planned) |
| Database | PostgreSQL 16 (Neon in development) |
| Cache and events | Redis (planned, Upstash) |
| Auth | RS256 JWT, refresh tokens |

## Repository layout
shopstream/
apps/
web/ Next.js storefront, vendor and admin dashboards
services/
core-api/ Spring Boot API
inventory-engine/ Rust stock service (in progress)
docs/
HANDOFF.md Working notes (private)
docker-compose.yml Local Postgres, Redis, Mailpit
.env.example Docker variables

## Quick start (Windows, PowerShell)

Prerequisites: JDK 25, Maven 3.10, Node.js 20 or newer, a PostgreSQL database (Neon or local), and RSA keys for JWT.

1. Generate JWT keys in `services/core-api/keys/`. See [services/core-api/README.md](services/core-api/README.md).
2. Create `services/core-api/.env` from `services/core-api/.env.example` and fill in your values.
3. Start the backend:

   ```powershell
   cd services\core-api
   & "C:\Program Files\apache-maven-3.10.0\bin\mvn.cmd" spring-boot:run
   ```

4. Check it: open `http://localhost:8080/api/v1/ping`. Expected: `status: ok`.
5. In a second terminal, start the frontend:

   ```powershell
   cd apps\web
   npm install
   npm run dev
   ```

6. Open `http://localhost:3000`.

The frontend sends API calls to `/api/v1` on port 3000. Next.js forwards them to the backend on port 8080, so no CORS setup is needed in development.

## Useful commands

| Where | Command | Purpose |
|---|---|---|
| `services/core-api` | `mvn clean compile` | Compile the Java service |
| `apps/web` | `npm run build` | Production build and type check |
| `apps/web` | `npm run lint` | ESLint |
| `services/inventory-engine` | `cargo build` | Build the Rust service (Rust required) |

## Documentation

- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)
- [Core API setup](services/core-api/README.md)
- [Storefront notes](apps/web/README.md)
- Working handoff notes: [docs/HANDOFF.md](docs/HANDOFF.md) (private, not for publication)

## License

No license is granted yet. All rights reserved by the author.