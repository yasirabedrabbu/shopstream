# Security

## Supported versions

Only the `main` branch is supported. This is a portfolio project, not a production service.

## Reporting a vulnerability

Do not open a public issue. Contact the repository owner directly through GitHub (https://github.com/yasirabedrabbu).

Include:
- What you found and where (file path, endpoint, or page)
- Steps to reproduce
- The impact you expect

You will get an acknowledgement within 7 days. Please allow time for a fix before public disclosure.

## Secrets

- Never commit `.env`, `*.pem`, passwords, tokens, or database connection strings.
- Mock payment endpoints and the demo seeder must be disabled in any real deployment (`PAYMENT_MOCK_ENABLED=false`, `SEED_ENABLED=false`).
- If a secret is exposed, rotate it immediately, then remove it from git history.

## Known limitations

- Login rate limit is per IP and in memory.
- Access tokens remain valid until expiry (60 minutes) even after a user is suspended.
- Swagger UI is enabled in development builds.