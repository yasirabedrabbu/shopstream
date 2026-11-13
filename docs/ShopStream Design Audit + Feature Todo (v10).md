# ShopStream: Design Audit + Feature Todo (v10)

Date: 2026-11-13. Covers design audit of the existing codebase, feasibility of all requested features, and a 12-step implementation plan.

---

## Part 1: Design Audit -- What exists now

### What is good

- Design token system is in place (globals.css has --color-bg, --color-surface, --color-border, --color-text, --color-accent)
- Dark mode works via data-theme and prefers-color-scheme
- Fonts: Sora (heading) + Manrope (body) -- solid pairing
- Accent color #E8F44A (neon yellow-green) is distinctive and consistent
- Rounded corners (rounded-2xl) used consistently
- Sticky nav with backdrop blur
- Mobile bottom dock in Sidebar.tsx
- Skeleton loading (animate-pulse) on product grid
- ProductCard has hover scale on image, hover border color change
- Flash sale badge
- Responsive grid (2 col mobile, 4 col desktop)

### What is missing or weak

#### Storefront

- Hero has no real visual. Just text + category pills. No image, no illustration, no background treatment.
- ProductCard has no Add to Cart button visible. User must click into product to buy.
- No search bar anywhere on the storefront.
- Nav has no cart icon or cart count badge.
- No footer.
- No trust badges (payment icons, delivery promise).
- Category filter on products page exists but no visual treatment.
- No product image gallery (product detail has only 1 image shown).
- No review stars visible on ProductCard.

#### Vendor Dashboard

- Chart is a raw div bar chart with no labels, no axis, no tooltip (just title attribute).
- Stat tiles are plain. No trend indicator (up/down vs last period).
- No icon in stat tiles.
- Pipeline and Low Stock panels are plain text rows.
- No quick action buttons (New Product, View Orders).

#### Auth pages

- Login and register are functional but plain. No logo mark, no illustration, no brand color treatment beyond the border.

#### Sidebar

- Uses emoji as icons. Looks unprofessional for a "world class" dashboard.
- No collapse state. Fixed 56 wide.
- No user avatar or store name at the bottom.

#### Global

- No micro-animations beyond hover scale on ProductCard and sidebar link.
- No page transition.
- Buttons are inconsistent -- some are rounded-full, some rounded-xl.
- Input focus state only changes border color to accent. No ring, no glow.
- Toast component exists but style unknown (not read yet).
- No empty state illustrations.
- No error state illustrations.

#### Missing UI components

- Command palette / search overlay
- Notification bell with dropdown
- Breadcrumb
- Data table with sortable columns
- Date range picker
- File upload dropzone
- Progress stepper (for onboarding, checkout)
- Chart library (Recharts or similar) -- current chart is CSS bars only

---

## Part 2: New Feature List -- Feasibility Check

### From your Bangla list

| # | Feature | Possible? | Notes |
| --- | --- | --- | --- |
| 1 | Store builder (drag and drop, templates, Bangla+English, logo/banner/color/font, mobile preview, custom domain, pages) | Yes | Step 11 in handoff. Big. Split into sub-steps. Custom domain needs DNS provider decision (pending decision 4). |
| 2 | Product management (CSV/Excel bulk upload, variants, image upload, SEO, draft/scheduled) | Yes | Step 3 in handoff. Object storage decision needed first (pending decision 2). |
| 3 | Inventory (real-time, low-stock alert, multi-location, reserve/release, history) | Yes | Step 4 in handoff. Rust engine already written, needs compile + wire-up. |
| 4 | Order management (list/filter/search, timeline, PDF invoice/packing slip, bulk action, manual order, notes) | Yes | Step 7 in handoff. PDF needs a library (iText or JasperReports on Java side). |
| 5 | Payment BD (bKash, Nagad, Rocket, SSLCOMMERZ, COD, partial payment, refund, payout, settlement report) | Yes, partial | SSLCOMMERZ sandbox exists. bKash and Nagad need merchant agreement (not started). COD is in scope for step 6. |
| 6 | Delivery + logistics (Pathao, Steadfast, RedX, Paperfly, delivery charge by zone, COD reconciliation, return/exchange) | Yes | Step 8 in handoff. All need merchant API access (not started). Delivery zones (division/district/thana) is a BD dataset task. |
| 7 | Customer (profile, wishlist, cart, abandoned cart, coupon, loyalty points, reviews, segments) | Yes | Steps 5, 10 in handoff. |
| 8 | Marketing + SEO (meta/sitemap/robots/JSON-LD, FB Pixel, GA4, TikTok Pixel, FB+IG shop sync, email/SMS/WhatsApp campaign, flash sale scheduler) | Yes | Steps 12, 13 in handoff. Meta app review can take weeks -- start early. |
| 9 | Notification (order SMS+email, delivery SMS, abandoned cart, template editor) | Yes | Step 9 in handoff. SMS gateway decision needed (pending decision 1). |
| 10 | Analytics + reports (sales, profit, conversion, traffic source, export Excel/PDF) | Yes | Step 14 in handoff. Timezone bug fix included. |
| 11 | Integration hub (one-click connect, accounting, chat, webhook) | Yes | Step 15 in handoff. OAuth connect flows needed per provider. |
| 12 | Team + access (staff accounts, roles, activity log, 2FA) | Yes | Step 2 in handoff. |
| 13 | Platform ops (multi-tenant, subscription billing, backup, support ticket, help center, onboarding wizard) | Yes | Step 1 + Step 16 in handoff. |
| 14 | Mobile (business owner mobile dashboard, push notification, offline order entry) | Partial | PWA with web push is in Step 16. Native app (iOS/Android) is NOT in the current 16-step plan -- needs a decision. Offline order entry is possible via PWA + IndexedDB but not planned yet. |

### New features NOT in the current 16-step plan

| Feature | Status | What it needs |
| --- | --- | --- |
| Drag and drop page builder (store builder) | Not planned in detail | A visual block editor -- Craft.js or custom. This is 4-6 weeks of work alone. |
| WhatsApp order intake (not just notification) | Partially planned (Step 9 channels) | WhatsApp Business API -- Meta approval needed. |
| Offline order entry (PWA + IndexedDB) | Not planned | Background sync API. Add to Step 16 scope. |
| Native mobile app | Not in plan | Needs a decision. React Native or Flutter on top of the existing API. Major scope. |
| Tally / QuickBooks accounting export | Step 15 | Tally XML format is known. QuickBooks needs OAuth. |
| Bangladesh division/district/thana delivery zone dataset | Not planned as a task | Need to source the BD admin boundary data (open source available). Add to Step 8 prep. |
| Flash sale campaign scheduler (UI) | Partial | Backend flash sale fields exist (V7 migration). Frontend scheduler UI not built. |

---

## Part 3: 12-Step Implementation Todo

This replaces the handoff's 16 steps with a reordered plan that puts design and foundation first, so every step ships something that looks good.

### Step 1 -- Design system upgrade

Goal: every page looks premium before we build new features.

Tasks:

- Replace emoji icons in Sidebar with Lucide React icons
- Upgrade globals.css: add --radius, --shadow, --transition tokens; add gradient accent variable
- Build a shared Button component: variants primary, secondary, ghost, danger; sizes sm, md, lg
- Build a shared Input component: focus ring with accent glow, error state, label, helper text
- Build a shared Card component: flat, elevated, bordered variants
- Build an EmptyState component: illustration slot, title, description, action button
- Build a DataTable component: sortable columns, sticky header, row hover, pagination
- Add Lucide React to package.json
- Add a chart library (Recharts) to package.json
- Add smooth page transition (Next.js 16 View Transitions API)
- Upgrade ProductCard: add Add to Cart button on hover, show star rating, show stock badge
- Upgrade Nav: add cart icon with count badge, add search icon that opens overlay
- Add footer: logo, links, payment icons (bKash, Nagad, SSLCOMMERZ, COD), social links
- Add a SearchOverlay component (command palette style)
- Upgrade Hero: add a visual -- animated gradient background + floating product mockup cards

Done when: every existing page uses the new components and passes a visual review by the owner.

Depends on: nothing.

### Step 2 -- Multi-tenant foundation + auth hardening

Goal: every vendor row is isolated; email verify and 2FA work.

Tasks:

- Add store\_id guard to every vendor service method and query
- Add tenant context to JWT claims
- Add subscriptions table (Flyway V14)
- Email verification on register (send token, verify endpoint)
- TOTP 2FA (setup, verify, disable)
- Staff invite: roles OWNER, MANAGER, PACKER, SUPPORT
- Activity log table (Flyway V15): actor, action, entity, before, after, ip, timestamp
- Frontend: email verify page, 2FA setup page, staff invite page, activity log page
- Tests: store A cannot read store B data

Done when: tenancy test passes and a PACKER cannot change a price.

Depends on: Step 1.

### Step 3 -- Catalog v2 (variants, images, bulk upload)

Goal: real product catalogs.

Tasks:

- Decide object storage provider (Cloudflare R2 recommended -- free egress, S3-compatible)
- Flyway V16: product\_variants table (option groups, option values, stock per variant, SKU, price delta)
- Flyway V17: product\_seo table (title, description, slug, og\_image)
- Image upload endpoint: multipart, resize to 800px, store to R2, return URL
- Bulk import endpoint: CSV and XLSX, row-level error report in response
- Draft and scheduled publish: add status DRAFT, SCHEDULED, published\_at column
- Frontend: variant editor UI (size/color picker builder), image upload dropzone, bulk import page, SEO fields in product form, scheduled publish toggle

Done when: 500-row CSV imports with correct per-row errors.

Depends on: Step 2.

### Step 4 -- Inventory engine (Rust, zero oversell)

Goal: stock is never wrong.

Tasks:

- Compile Rust engine: fix all cargo build errors one by one
- Add HttpInventoryClient in Java (replace StubInventoryClient)
- Wire reserve on order create, finalize on payment success, release on cancel/expiry
- Redis Streams: publish stock events
- SSE endpoint: push live stock to vendor dashboard
- Multi-location: add locations table, stock\_per\_location table
- Stock history and adjustment log
- Low-stock alert event (threshold configurable per product)
- Load test: 100 concurrent buyers, stock 10, verify exactly 10 sold

Done when: load test passes.

Depends on: Step 3.

### Step 5 -- Cart, coupons, delivery zones

Goal: real multi-item shopping.

Tasks:

- Server-side cart (cart table, cart\_items table, Flyway V18)
- Cart API: add item, remove item, update qty, get cart, clear
- Coupons table (Flyway V19): code, type (percent/fixed), min\_order\_cents, expires\_at, usage\_limit, per\_customer\_limit
- Apply coupon to cart: validate, deduct, record usage
- BD delivery zones dataset: load division/district/thana data
- Delivery zones table (Flyway V20): zone\_name, area\_type, delivery\_charge\_cents
- Frontend: cart drawer (slide-in from right), coupon input field, delivery zone selector at checkout, multi-item checkout page

Done when: 3-item cart with coupon and delivery zone totals correctly in a test.

Depends on: Step 4.

### Step 6 -- Payments v2 (bKash, Nagad, COD, payout ledger)

Goal: every BD payment method works.

Tasks:

- Payment adapter interface (already partially exists as PaymentGateway.java)
- Implement bKash adapter (sandbox first -- requires merchant agreement, start application now)
- Implement Nagad adapter (sandbox first -- requires merchant agreement, start application now)
- Implement Rocket adapter
- COD as a payment method: COD\_PENDING, COD\_COLLECTED statuses
- COD collection tracking: mark collected, record collector, amount
- Advance/partial payment: allow partial amount, track balance
- Vendor payout ledger table (Flyway V21): gross, commission\_pct, commission\_cents, net\_cents, payout\_status
- Payout API: list payouts, mark paid
- Fix: gateway refund succeeds but DB commit fails (wrap in outbox, covered by Step 8)
- Frontend: payment method selector UI (bKash/Nagad/SSLCOMMERZ/COD), COD collection UI for vendor, payout ledger page

Done when: COD order and SSLCOMMERZ sandbox order both reach final status and ledger balances.

Depends on: Step 5.

### Step 7 -- Order management v2

Goal: owners can run daily operations.

Tasks:

- Order timeline: order\_events table (Flyway V22), record every status change and payment event
- Internal notes: order\_notes table (Flyway V23)
- Manual order entry: endpoint and UI (for phone/Facebook orders)
- Invoice PDF: generate with iText or Apache PDFBox on Java side
- Packing slip PDF: same library
- Bulk status update: endpoint accepts list of order IDs and target status
- Cancellation rules: block cancel if already SHIPPED or DELIVERED
- Frontend: order timeline component, notes section, manual order form, Print Invoice button, Print Packing Slip button, bulk action toolbar

Done when: owner can print packing slips for 20 orders in one action.

Depends on: Step 6.

### Step 8 -- Delivery + courier integration

Goal: book and track deliveries from dashboard.

Tasks:

- Courier adapter interface: CourierGateway.java (book, track, cancel)
- Implement Steadfast adapter (most accessible sandbox for BD)
- Implement Pathao adapter
- Implement RedX adapter
- Implement Paperfly adapter
- Consignment ID stored on order
- Webhook receiver: update tracking status on incoming webhook
- COD reconciliation: amount courier collected vs amount due
- Return and exchange flow: return\_requests table (Flyway V24)
- BD division/district/thana dataset loaded (from Step 5 prep)
- Frontend: courier selector on order page, tracking status display, COD reconciliation table, return request form

Done when: test order booked on Steadfast sandbox, status updates via webhook.

Depends on: Step 7.

### Step 9 -- Notification engine + outbox

Goal: every message goes out reliably.

Tasks:

- Transactional outbox table (Flyway V25): event\_type, payload, status, attempts, next\_retry\_at
- Outbox relay: poll table, publish to Redis Streams, mark sent
- Choose SMS gateway: recommend SSL Wireless or Muthophone (verify pricing and sender ID rules)
- SMS adapter: send, check delivery status
- Email adapter: SMTP (use Resend or Brevo free tier -- verify)
- WhatsApp adapter: WhatsApp Business API via Meta (requires approval)
- Notification template table (Flyway V26): channel, event\_type, lang, subject, body\_template
- Template editor UI: variable substitution preview, Bangla and English tabs
- Delivery log: notification\_log table (Flyway V27)
- Retry with exponential backoff
- Fix the gateway-refund-but-DB-fails bug by wrapping refund in outbox
- Frontend: template editor page, notification log page, channel toggle per store

Done when: kill app mid-send, restart, message still delivered exactly once.

Depends on: Step 6, Step 8.

### Step 10 -- Customer experience + loyalty

Goal: returning customers buy again.

Tasks:

- Customer profile: saved addresses (customer\_addresses table, Flyway V28)
- Wishlist: wishlists table (Flyway V29)
- Order history with reorder button
- Customer segments: computed from order history (bought\_twice, inactive\_60d, high\_value)
- Loyalty points: loyalty\_ledger table (Flyway V30), earn on PAID, redeem at checkout
- Review moderation: vendor can approve/reject reviews
- Abandoned cart reminder: trigger via Step 9 notification engine after 1 hour in cart
- Frontend: profile page, addresses page, wishlist page, reorder button on orders, loyalty points balance and history, review moderation UI for vendor

Done when: loyalty point earned on order 1 redeemed on order 2 and ledger balances.

Depends on: Step 5, Step 6, Step 9.

### Step 11 -- Store builder + SEO + marketing

Goal: owners build a good-looking store and get found.

Tasks:

- Theme system: theme table per store (colors, fonts, spacing from design tokens)
- Section blocks: hero, product grid, banner, text, contact, FAQ -- stored as JSON page\_sections
- Pages table: home, about, contact, privacy, return policy, terms -- Bangla and English content
- Preview before publish: ?preview=true query param renders draft
- Custom domain: DNS TXT verification step, store custom\_domain and verified\_at
- Sitemap generator: /sitemap.xml per store
- robots.txt per store
- Canonical URLs and Open Graph tags on product and store pages
- JSON-LD product schema
- Facebook Pixel: store fb\_pixel\_id, inject script on storefront
- GA4: store ga4\_id, inject script
- TikTok Pixel: store tiktok\_pixel\_id, inject script
- Campaign scheduler: flash sale with start\_at, end\_at, discount\_pct or discount\_cents
- Email campaign: recipient list from customer segments (Step 10), send via Step 9 email adapter
- SMS campaign: same
- Facebook and Instagram product feed: generate XML/CSV in Meta catalog format, scheduled refresh job
- Frontend: theme editor (color/font picker with live preview), section block editor (add/remove/reorder blocks), page editor with Bangla/English tabs, custom domain setup wizard, campaign scheduler UI, pixel/analytics config page
- Verify Meta feed file against Meta catalog checker (manual step by owner)

Done when: product page passes Google Rich Results Test; owner builds a 3-page store in under 15 minutes.

Depends on: Step 3, Step 10.

### Step 12 -- Analytics, integration hub, and launch

Goal: the platform can be sold and deployed.

Tasks:

- Sales report: revenue, orders, units, AOV -- grouped by day/week/month in tenant timezone
- Profit report: revenue minus cost price (cost\_price\_cents added to products in Step 3)
- Conversion funnel: visit event, add\_to\_cart event, checkout\_started event, paid event -- store in analytics\_events table
- Traffic source: UTM parameter capture on first page load, stored with order
- Export to XLSX: use Apache POI on Java side
- Export to PDF: reuse iText from Step 7
- Fix UTC day bug: all report queries use store timezone (Asia/Dhaka default)
- Integration hub UI: connector registry page, connect/disconnect/status per integration
- OAuth connect flow for QuickBooks
- Tally export: generate Tally XML file on demand
- Accounting: QuickBooks connector (OAuth)
- Chat: Messenger webhook, Tawk.to script inject, WhatsApp from Step 9
- Outbound webhooks: webhook\_subscriptions table, delivery with retry
- Subscription billing: plans table, feature gates per plan, billing cycle
- Support tickets: tickets table, vendor creates, admin resolves
- Help center: static pages or a simple markdown-based knowledge base
- Onboarding wizard: 5-step flow for new stores (store name, logo, first product, payment method, delivery zone)
- Backup: pg\_dump scheduled daily, stored to object storage
- Data export per tenant: ZIP of all their data
- Observability: structured JSON logs, Sentry for error tracking (verify free tier)
- Production deploy: Render or Railway for Java (verify free tier), Vercel for Next.js, secrets in host env, PAYMENT\_MOCK\_ENABLED=false, SEED\_ENABLED=false
- PWA: manifest.json, service worker, web push via VAPID
- CI: GitHub Actions for Java (Maven test), Next.js (build check)
- Rust CI already exists

Done when: a new owner signs up on the production URL and takes a real order end to end.

Depends on: all steps above.

---

## Pending decisions (must resolve before the step that needs them)

| Decision | Needed by | Recommendation |
| --- | --- | --- |
| Object storage provider | Step 3 | Cloudflare R2 (free egress, S3-compatible, no cold start) |
| SMS gateway provider | Step 9 | SSL Wireless or Muthophone -- verify current pricing and sender ID rules |
| Email service | Step 9 | Resend free tier (3,000/month) or Brevo (300/day free) |
| Subscription plan pricing and limits | Step 12 | Decide before writing billing code |
| Custom domain DNS and SSL | Step 11 | Cloudflare (free SSL, easy DNS API) |
| Native mobile app scope | Before Step 12 | PWA covers most cases; native app is a separate major project |
| Tax, VAT, trade license, data protection | Before launch | Get legal/accountant advice in Bangladesh |

---

## External approvals (start immediately)

| Provider | Needed by | Action |
| --- | --- | --- |
| bKash merchant | Step 6 | Apply at merchant.bkash.com -- process and timeline verify kora dorkar |
| Nagad merchant | Step 6 | Apply at nagad.com.bd -- verify process |
| Pathao courier API | Step 8 | Contact Pathao business team |
| Steadfast API | Step 8 | Steadfast has a public API -- verify sandbox access |
| RedX API | Step 8 | Contact RedX |
| Paperfly API | Step 8 | Contact Paperfly |
| Meta app review (Facebook/Instagram shop) | Step 11 | Start Meta Developer app now -- catalog API and product feed policy |
| WhatsApp Business API | Step 9 | Via Meta -- same app review process |
