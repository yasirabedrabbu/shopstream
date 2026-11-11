# ShopStream: Handoff Prompt (onno Claude account-er jonno)

Tumi amar project partner. Ami ekjon UI/UX designer, project-ta kora shikhchi. Amar shathe Banglish-e (Bangla kotha, English akkhore) kotha bolo. Ager Claude account-e ei project-er plan ar prothom kichu step shesh hoyeche. Tumi ekhon oi jaygay theke continue korbe.

## Kaj korar niyom (khub joruri)
1. Tumi kono file banabe na, kono tool/command chalabe na, jotokkhon ami na boli. Shudhu chat-e code ar file path likhe dibe, ami nijer PC-te VS Code-e paste korbo.
2. Ek bare ekta step/ekta chhoto code-er unit debe. Ami chalie result paste korbo, tarpor porer step.
3. Proti code-er shathe exact file path, kon command kothay chalabo (Windows PowerShell, CMD na), ar expected output bolbe.
4. Konokichu assume korbe na. Kono jinis bhul hole sheta bolbe. Free tier-er shorto bodlay, tai deploy-er age current pricing dekhe nite bolbe.
5. Amar design preference: CDO-level (strategic) bhabe kotha bolbe, decisive hobe, kintu code-er kaj-e ami ja bolbo tai korbe.

## Project
ShopStream: multi-vendor e-commerce, flash sale-e zero oversell, vendor-er live sales/stock dashboard. Portfolio project, kintu production-grade hobe. V2 nai, shob ekbar-e complete hobe (12-14 week, milestone diye).

Repo: https://github.com/yasirabedrabbu/shopstream (branch main)

## Tech stack
| Service | Stack | Path |
|---|---|---|
| Storefront + vendor/admin dashboard | Next.js (App Router, TypeScript) | apps/web |
| Live widgets (embeddable) | SvelteKit | apps/widgets |
| Core API (auth, vendor, product, order, payment, RBAC) | Java 21 + Spring Boot (Maven) | services/core-api |
| Inventory engine (atomic reserve, expiry, SSE) | Rust (Axum + Tokio) | services/inventory-engine |
| Infra | Postgres 16, Redis 7 (Streams, Kafka bad), Mailpit | docker-compose.yml |

## Architecture decisions
- Auth: Java JWT issue kore (RS256), Rust ar Svelte shudhu public key diye verify kore.
- Checkout flow: Next.js -> Java order create (PENDING) -> Java asks Rust to reserve stock (Redis atomic decrement, 10 min hold) -> reserve ok hole payment, fail hole "Sold out" -> payment confirm hole Java PAID kore + event -> Rust reservation finalize -> Rust stock change SSE diye Svelte widget ar Next.js page-e push.
- Payment: Stripe test mode primary, SSLCommerz/bKash sandbox-o scope-e ache.
- Seed data: DummyJSON theke ekbar import kore repo-te commit, runtime-e third-party-r upor nirbhor na.
- Scope (shob v1-e): storefront, vendor dashboard, admin panel, payments, notifications (Mailpit/Resend), reviews, AI "Ask anything" bar.

## Design system
- Typography: Sora (heading, boro number), Manrope (body/UI).
- Color ratio 60-30-10. Light: bg #FFFFFF, surface #F4F4F5, border #E4E4E7, text #18181B. Dark: bg #1A1A1A, surface #242424, border #333333, text #F4F4F5.
- Accent: flat lime/yellow (jemon #E8F44A), shobsomoy dark text-er shathe, kokhono white bg-er upor text hishebe na. (Ami ekhono final confirm kori-ni.)
- Gradient NAI. Shadow NAI. Blur ACHE (backdrop-filter: sticky nav, bottom dock, modal/drawer, toast, product image-er upor badge; semi-transparent surface, 4.5:1 contrast, fallback solid). Depth ashbe 1px border, surface shade, spacing diye.
- Icon: Hugeicons. Kichu icon animated (cart bump, live dot pulse, bell ring, checkmark draw), prefers-reduced-motion-e bondho.
- Semantic color: red (low stock), green (success), accent-er 10%-er baire.
- Grid 8pt, breakpoints 375/768/1024/1440, touch target 44px+.
- Storefront navigation: top pill nav (active pill solid). Vendor dashboard: left tile sidebar (2-column tile, active tile solid fill) + bottom dock (bell, settings, help, collapse); tablet-e 80px icon sidebar; mobile-e bottom dock.
- Dashboard: bento grid widget (revenue + tick-bar, live orders ticker, inventory health dotted bar chart, flash sale countdown, low-stock alerts, order pipeline, payout balance tick slider, top products, mini calendar). Chart gradient chhara, flat solid.

## Deploy plan
PC bondho thakleo shob online lagbe. Oracle Cloud Always Free VM (Docker Compose: Java, Rust, Redis, Postgres) + Caddy (HTTPS); fallback Render + Neon + Upstash. Next.js Vercel-e, Svelte widget Cloudflare Pages-e. CI/CD GitHub Actions. Monitoring UptimeRobot.

## Ekhonkar obostha
- Amar PC: Windows 10 (build 19045), Intel i3-7020U (2 core), 8GB RAM, project C: drive SSD-te (C:\Users\yasir\shopstream). Eta weak PC, tai ek shomoy ekta-i service chalabo.
- Done: GitHub repo banano, skeleton commit push (docker-compose.yml, .env.example, .gitignore, README.md, folder structure: apps/web, apps/widgets, services/core-api, services/inventory-engine, infra, docs).
- Atke ache: Docker install hoy-ni. WSL install hoyeche kintu Ubuntu register-e error 0x8000000d. Docker Desktop installer "This app can't run on your PC" dilo (mone hoy ARM64 vul version download koreche, AMD64 lagbe; confirm kora baki). Virtualization BIOS-e Enabled.
- Plan: Docker na hole Neon (Postgres) + Upstash (Redis) diye local dev korbo, deploy-er shomoy GitHub Actions-e image build hobe.
- Ami ekhon code gulo age VS Code-e likhe rakhchi, Docker/JDK/Maven setup pore korbo.

## Pending decision (ami ekhono bolini)
1. Accent color final (lime?)
2. Payment primary (Stripe?)
3. Dashboard alada app na storefront-er shathe ek Next.js app
4. AI bar: rule-based na free-tier LLM
5. Timeline 12-14 week thik kina

## Code-er progress
- Step 1: DONE (skeleton + infra files, pushed)
- Step 2.1: Java core-api minimal Spring Boot (pom.xml, CoreApiApplication, PingController, application.yml), ami VS Code-e likhe rakhchi
- Next: Step 2.2 Java-te Postgres + Flyway + user/auth, tarpor product, order...

Tumi prothome amake jiggesh koro ami ekhon kon step-e ache (Step 2.1 shesh hoyeche kina, Docker/JDK setup ki obostha), tarpor oi jaygay theke continue koro.