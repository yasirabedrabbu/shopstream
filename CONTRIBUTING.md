# Contributing

ShopStream is a portfolio project. External contributions are not accepted at this time.

If you are the owner or a collaborator working with an AI assistant, follow these rules.

## Branches

- `main`: stable code. Protected. Merge only after the build passes.
- `dev`: integration branch for work in progress.
- Feature branches: `feat/<short-name>`, `fix/<short-name>`, `docs/<short-name>`.

## Commit messages

Use the imperative mood and keep the subject under 72 characters.
feat(core-api): add mock payment confirm endpoint
fix(web): wrap useSearchParams in Suspense
docs: add core-api setup guide

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`.

## Before you open a pull request

Backend (`services/core-api`):

```powershell
mvn clean compile
```

Frontend (`apps/web`):

```powershell
npm run lint
npm run build
```

Rust (`services/inventory-engine`):

```powershell
cargo build
cargo clippy --all-targets -- -D warnings
```

A change is "done" only when the build passes. A change is "verified" only when the app was run and the endpoint or page was checked.

## Code rules

Backend:
- Keep controllers thin. Business logic goes in services.
- Money is always `long` cents. Never use floating point for money.
- Every list endpoint returns `PageResponse`.
- Every schema change is a new Flyway migration (`V14__...sql`). Never edit an applied migration.
- Never log passwords, tokens, or connection strings.

Frontend:
- Read the matching backend DTO and controller before calling an endpoint. Do not guess paths, methods, or field names.
- All API calls go through `src/lib/api.ts`. Pages do not call `fetch` directly.
- All types live in `src/lib/types.ts` and mirror backend DTOs.
- Use design tokens (`var(--bg)`, `var(--text)`, and so on) and the accent `#E8F44A`. Do not hard-code other colors.
- Touch targets are at least 44px. Layouts work at 375px width.
- No gradients and no shadows, per the design system.
- Pages that read `useSearchParams` must sit inside `<Suspense>`.
- Dynamic route pages must not export `dynamic` while `cacheComponents` is enabled.

Rust:
- Run `cargo fmt` before committing.
- No `unwrap()` in request handlers.

## Secrets

Never commit `.env`, `*.pem`, passwords, or tokens. If a secret is committed by mistake, rotate it first, then remove it from history. Report it in the security channel described in [SECURITY.md](SECURITY.md).

## Documentation

Update the README when a setup step changes. Update `docs/HANDOFF.md` at the end of each working session.