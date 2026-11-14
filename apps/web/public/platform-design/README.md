# ShopStream platform handoff

- `shopstream-platform-design-spec.json`: five exact page/frame names, responsive dimensions, reusable component definitions, type scale, token collection, and Dark/Light values.
- `tokens.json`: variable collection specification only.

These JSON files are implementation/import specifications, **not** native Figma files or a claim that native Figma variables/components have been authored. A Figma importer or manual setup is needed to create the corresponding native design objects.

Source of truth: `lib/platform/design.ts`. Regenerate with:

```sh
node --experimental-strip-types scripts/export-platform-design.mjs
```

The working app starts at `/platform/overview`. All administration is frontend-only sample behavior, retained while the platform layout remains mounted. Reloading clears changes. No real accounts, passwords, emails, payments, or production settings are changed.

Verification: `npm test`, `npm run build`, and focused ESLint on `app/platform`, `components/platform`, and `lib/platform`. The optional `tests/platform-browser.cjs` runner needs Playwright installed externally or locally and the existing preview running; set `CHROMIUM_PATH` if using a system browser. Do not start another development server in Figma Make.
