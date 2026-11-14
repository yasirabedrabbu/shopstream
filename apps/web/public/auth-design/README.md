# ShopStream authentication design handoff

- `shopstream-auth-design-spec.json`: four routes, eight mobile/desktop frame specifications, reusable components, dimensions, interactions, typography, and default/loading/error/success variants.
- `tokens.json`: shared named color tokens in Light/Dark modes, spacing, radii, auth dimensions, and dark brand-panel aliases.
- Source: `lib/auth-pages/design.ts`; regenerate with `node --experimental-strip-types scripts/export-auth-design.mjs`.
- Each route also has a **Design handoff** download and a **State** selector for examining all four visual states without API calls.

Desktop frames are 1440px wide, with a dark #111114 brand panel and a 400px-max form. Mobile frames are 375px wide with the brand panel hidden; registration scrolls vertically. The split layout begins at 1024px. Sora headings and Manrope body fonts reuse the root font setup. All symbols use Hugeicons. Role cards are 100×80px; OTP fields are 48×56px with 8px gaps (smaller screens below 360px adapt to prevent overflow).

The testimonial and avatar illustrate a fictional seller story, not an independently verified endorsement.

## Behavior and integration boundaries

In demo mode these are interactive frontend previews, not real authentication or email delivery. Use fictional details. Login creates no session; registration stores no account. Reset confirmation generates no reset link. OTP demonstration uses the public code `123456` and a 60-second resend cooldown; no email is sent. Email and role stay in mounted React memory only.

When the existing API is configured, login retains token/user persistence and safe return-path behavior; buyer registration uses the existing API contract. Phone and role preferences are not sent to unsupported API fields. Seller/Business registration and reset/verification delivery explicitly report the missing integration rather than pretending to succeed. No new endpoints or credentials have been invented.

These JSON files are implementation/import specifications, **not native editable .fig files** and not an automatically installed Figma variable collection.

## Code structure

- `app/auth/[route]/page.tsx`: thin route adapters.
- `components/auth/[route]/`: route-specific forms, field groups, and success/feedback views.
- `components/auth/states/`: separate loading, empty, error, and success components.
- `components/layout/auth/`: authentication shell, brand panel, top bar, and footer.
- `components/ui/`: existing shared base Button and Input controls, reused without changing their public contracts.
- `lib/auth/[route]/`: form hooks; shared context, operations, and tokens remain in `lib/auth/`.
- `app/auth/styles/`: small, ordered token-driven style modules.

Auth components have one component per file, an explicit props interface, and no more than five component imports. Authentication source, styles, tests, and generated artifacts stay within 100 lines per file. Existing unrelated application/design-system files are outside this refactor.

No authentication component injects inline styles. Shared platform tokens plus `lib/auth/style-tokens.json`, `lib/auth/tokens.ts`, and `lib/auth-pages/dimensions.ts` produce the token CSS during export. Literal values belong only in those token definitions; component CSS declarations reference variables. Static media-query breakpoints use normal CSS syntax because CSS variables are not supported inside media conditions.

Run `npm test` for behavior and structure guards. The optional browser suite is `node tests/auth-browser.cjs` with Playwright available; it covers every route/state, validation, keyboard operation, OTP paste/autofill, resend cooldown, design downloads, and mobile/desktop overflow.
