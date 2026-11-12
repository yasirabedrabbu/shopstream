# ShopStream

Multi-vendor e-commerce platform with zero-oversell flash sales and a live vendor dashboard.

Built to production-grade standards as a portfolio project.

## Stack

| Service | Tech |
|---|---|
| Storefront + Dashboard | Next.js (App Router, TypeScript) |
| Core API | Java 21, Spring Boot 3.4.1 |
| Inventory Engine | Rust (Axum, Tokio) |
| Live Widgets | SvelteKit |
| Database | PostgreSQL 16 |
| Cache / Streams | Redis 7 |

## Architecture

Browser → Next.js → Java Core API → Rust Inventory Engine
↓
PostgreSQL + Redis

## Key features

- Flash sales with atomic stock reservation (no oversell)
- Multi-vendor: each vendor manages own products, orders, dashboard
- Live stock and sales dashboard via SSE
- RS256 JWT auth (Java issues, Rust and Svelte verify)
- SSLCOMMERZ payment gateway (sandbox ready)
- Admin panel: vendors, products, users, payments, refunds

## Project status

Phase 1 (Java core-api): complete, pending first compile
Phase 2 (Setup + first run): next
Phase 3 (Rust inventory engine): code written, pending compile
Phase 4 (Frontend): not started

## Local dev (coming in Phase 2)

Requirements: JDK 21, Maven, Rust, Node 20, PostgreSQL, Redis

## License

MIT