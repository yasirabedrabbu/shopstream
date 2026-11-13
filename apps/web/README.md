# ShopStream Web

Next.js 16 storefront, vendor dashboard, and admin panel for ShopStream.

## Stack

- Next.js 16.4 (App Router, Turbopack)
- React 19.3
- Tailwind CSS 4.3 with `@tailwindcss/postcss`
- TypeScript
- Fonts: Sora (headings), Manrope (body)

## Setup

```powershell
cd apps\web
npm install
```

Create `apps\web\.env.local`:

```env
NEXT_PUBLIC_API_URL=/api/v1
API_PROXY_TARGET=http://localhost:8080
```

`/api/v1` requests from the browser are forwarded to the Spring Boot backend by `next.config.ts`. The backend must be running on port 8080.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Development server on `http://localhost:3000` |
| `npm run build` | Production build and type check |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Routes

| Area | Routes |
|---|---|
| Storefront | `/`, `/products`, `/products/[slug]`, `/stores/[slug]` |
| Auth | `/auth/login`, `/auth/register` |
| Customer | `/account/orders`, `/account/orders/[id]` |
| Vendor | `/vendor/dashboard`, `/vendor/products`, `/vendor/products/new`, `/vendor/products/[id]/edit`, `/vendor/orders` |
| Admin | `/admin/dashboard`, `/admin/vendors`, `/admin/products`, `/admin/users`, `/admin/categories`, `/admin/payments` |

## Folder structure

src/
app/ Routes (App Router)
components/ Shared UI (Nav, Sidebar, ProductCard, Modal, Toast, Badge)
lib/ api.ts (fetch wrapper), types.ts (DTO mirror), auth.ts, money.ts

## Design system

- Light and dark themes through CSS variables in `src/app/globals.css`.
- Accent: lime `#E8F44A` with dark text.
- Flat surfaces. No gradients, no shadows.
- 8pt spacing grid. Breakpoints 375, 768, 1024, 1440.
- Minimum touch target 44px.

## Troubleshooting

- `Failed to fetch` on the homepage: the backend is not running. Start it and open `http://localhost:8080/api/v1/ping`.
- Styles missing: confirm `postcss.config.mjs` exists and `@tailwindcss/postcss` is installed.
- `Method 'GET' is not supported`: the frontend called an endpoint with a different method or path than the backend. Compare with `services/core-api` controllers.
- After changing `next.config.ts` or `.env.local`, stop the dev server and restart it.