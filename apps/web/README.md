# ShopStream frontend

A responsive marketplace preview built with Next.js, React, TypeScript, and
Tailwind CSS. The default experience is frontend-only; it needs no backend or
credentials.

## What works in the demo

- Eight clearly labeled sample products across six categories and three sample stores.
- Search across product names, descriptions, categories, and stores.
- Category filtering, sorting, URL-based pagination, and browser back/forward navigation.
- Product details, quantity controls, unavailable-product states, and related finds.
- Guest checkout with delivery details, illustrative delivery charges, simulated
  payment choices, an editable review, and a demo completion screen.
- Account and order notices that explain that real accounts and orders are not connected.
- Local quick-help FAQs with an accessible keyboard-operable dialog.
- Responsive layouts, system dark mode, reduced-motion support, and optimized
  versions of the supplied photography.

No demo order, payment information, or delivery address is submitted or persisted.
Use the **Use example details** button rather than entering personal information.

## Commands

Dependencies are installed through `.figma/make/install` in Figma Make.
The preview server is managed automatically; do not start a second server there.

```sh
npm test
npm run lint
NODE_ENV=production npm run build
```

The explicit production environment avoids inheriting the sandbox's development
`NODE_ENV` during a production build.

`npm test` runs the catalog and safe-return-path regression tests with Node.js 22.
The full lint command also checks the imported admin/vendor dashboard code;
those untouched pages currently have seven `react-hooks/set-state-in-effect`
errors. The revised storefront files pass focused linting.

## Browser regression checks

Browser tooling is kept separate from application dependencies:

```sh
npm install --prefix /tmp/shopstream-ui-tests --no-package-lock playwright @axe-core/playwright
node /tmp/shopstream-ui-tests/node_modules/playwright/cli.js install chromium
NODE_PATH=/tmp/shopstream-ui-tests/node_modules node tests/browser-audit.cjs
```

Run against the existing preview at `http://localhost:3000`, or set the optional
`PLAYWRIGHT_BASE_URL` for another already-running preview. The test exercises the
demo shopping journey, mobile navigation, modal focus restoration, light/dark
accessibility checks, and verifies that no API calls or broken assets occur.
Screenshots are written to `/tmp/shopstream-*.png`, not the repository.

## Original API integration

The imported API integration is preserved. An explicitly configured
`NEXT_PUBLIC_API_URL` opts out of demo catalog mode. Real authentication, orders,
payments, and seller/admin data still require the original compatible service;
this UI work does not supply one. Do not use the frontend demo as a production
commerce or authentication service.
