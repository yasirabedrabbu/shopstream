# ShopStream tenant workspace handoff

Start the working application at `/workspace/overview`.

## Design exports

- `shopstream-workspace-design-spec.json`: six exact frame names, responsive dimensions, loading/empty/error/populated states, typography, component variants, shared brand variables, and role colors.
- `tokens.json`: the shared Dark/Light variable collection and workspace dimensions/role colors.

These JSON files are implementation/import specifications, **not native editable Figma files**, and do not claim that native Figma variables or components have already been authored. Use a compatible importer or recreate the documented variables/components in Figma.

The source of truth is `lib/workspace/design.ts`, which reuses the existing platform token source. Regenerate with:

```sh
node --experimental-strip-types scripts/export-workspace-design.mjs
```

## Behavior and privacy

This is an interactive, session-only frontend demonstration. Product edits, order status changes, campaigns, team invitations, tasks, journal posts, images, and store settings remain in browser memory while navigating workspace routes. Reloading resets them. No production authentication, courier, payments, emails, WhatsApp delivery, live sale prices, or public storefront publishing is connected.

Use fictional information only. The NID field is optional, masked, and never included in exports. Image uploads accept JPG/PNG/WebP up to 5 MB and remain in browser memory.

Use the footer’s **Preview screen state** selector on any screen to inspect all four designed states. Error previews include a functional retry action. Empty previews preserve the underlying sample dataset.

Dates explicitly use the sample snapshot of 30 November 2026 at 10:30 AM Bangladesh time. Newly performed actions appear as just completed.

## Verification

- `npm test`
- `NODE_ENV=production npm run build`
- `node node_modules/typescript/bin/tsc --noEmit`
- Focused ESLint: `node node_modules/eslint/bin/eslint.js app/workspace components/workspace lib/workspace scripts/export-workspace-design.mjs tests/workspace.test.mjs tests/workspace-browser.cjs`
- Optional browser runner: `tests/workspace-browser.cjs` needs Playwright available locally or externally. Set `CHROMIUM_PATH` for a system Chromium and `PLAYWRIGHT_BASE_URL` if the existing preview runs elsewhere. Do not start a second development server in Figma Make.
