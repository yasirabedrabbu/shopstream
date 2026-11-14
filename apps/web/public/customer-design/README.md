# ShopStream customer account handoff

Start at `/account/overview`. Account routes include orders, a dynamic order detail page, wishlist, shopping bag, and profile.

## Design files

- `shopstream-customer-design-spec.json`: 12 named frames — a Mobile (375px) and Desktop (1440px) variant for each of six screens, including order detail — plus component variants and all four screen states.
- `tokens.json`: shared brand variables with Light/Dark modes, readable aliases, semantic shipped color, 200px sidebar, and component dimensions.

These files are implementation/import specifications, **not native editable `.fig` files**. They do not claim that native Figma variables, components, or frames have been authored. Use an importer or manual setup to create those design objects.

Source: `lib/customer/design.ts`. Regenerate with:

```sh
node --experimental-strip-types scripts/export-customer-design.mjs
```

## Preview behavior

The customer account is a session-only frontend demonstration. Changes persist while navigating within account routes, not across reloads or leaving the mounted account layout. The footer state selector demonstrates loading, empty, error/retry, and populated states without deleting the sample data.

- Wishlist actions update the bag and overview counts.
- Quantities are limited to 1–10 per product. Delivery costs ৳80 per store. WELCOME10 discounts product subtotals of ৳1,000+ by 10%, capped at ৳300.
- Checkout review includes all bag items and creates separate sample orders per store, distributing the discount so the totals match. No real order, charge, payment-provider redirect, courier booking, email, or address submission happens.
- Unpacked processing orders can be cancelled. Delivered orders within 7 days of the stated demo date (30 November 2026) can request a return. No real cancellation, refund, or pickup is performed.
- Profile, avatar, and address changes stay in browser memory. Use fictional information only. EN/BN updates core labels/navigation, dates and numbers; product names remain as listed.
- The password form is a validation demonstration using the public fictional current password shown beside it. It neither persists nor changes credentials. Never enter real passwords.
- Existing API-backed order pages were preserved separately and remain selected when `NEXT_PUBLIC_API_URL` configures the existing app for live mode. That integration was not exercised without a configured live API.

## Verification

- `npm test`
- `NODE_ENV=production npm run build`
- `node node_modules/typescript/bin/tsc --noEmit`
- Focused ESLint: `node node_modules/eslint/bin/eslint.js app/account components/customer lib/customer scripts/export-customer-design.mjs tests/customer.test.mjs tests/customer-browser.cjs`
- `tests/customer-browser.cjs` is an optional Playwright runner against the already-running preview. Install/resolve Playwright externally or locally and optionally set `CHROMIUM_PATH` and `PLAYWRIGHT_BASE_URL`. Do not start another development server in Figma Make.
