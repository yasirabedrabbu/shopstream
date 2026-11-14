/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS runner resolves optional browser tooling via NODE_PATH. */
const { chromium } = require("playwright");
const AxeBuilder = require("@axe-core/playwright").default;
const assert = require("node:assert/strict");
const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors = [];
  const missing = [];
  const apis = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400 && !r.url().includes("favicon"))
      missing.push(`${r.status()} ${r.url()}`);
  });
  page.on("request", (r) => {
    if (r.url().includes("/api/")) apis.push(r.url());
  });
  async function goto(path) {
    await page.goto(baseURL + path);
    await page.locator("main").waitFor();
    await page.evaluate(() => document.fonts.ready);
  }
  async function axe(label) {
    const result = await new AxeBuilder({ page })
      .exclude("nextjs-portal")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    console.log(
      label,
      JSON.stringify(
        result.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
      ),
    );
    return result.violations.length;
  }
  let violations = 0;
  await goto("/");
  await page
    .getByRole("heading", { name: "The everyday cotton set" })
    .waitFor();
  // Trigger native lazy loading before capturing the complete editorial page.
  for (const image of await page.locator("main img").all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((element) => element.decode());
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "/tmp/shopstream-home-desktop.png",
    fullPage: true,
  });
  violations += await axe("home desktop");
  assert.equal(
    await page
      .locator("img")
      .evaluateAll(
        (imgs) =>
          imgs.filter((i) => !i.complete || i.naturalWidth === 0).length,
      ),
    0,
    "broken home images",
  );
  await page
    .getByRole("button", { name: "For your space", exact: true })
    .click();
  assert.equal(await page.locator("#the-edit h3").count(), 2);
  await page.getByRole("button", { name: "Under ৳2,000", exact: true }).click();
  assert.equal(await page.locator("#the-edit h3").count(), 3);
  await page.getByRole("link", { name: "Shop this edit", exact: true }).click();
  await page.waitForURL(/maxPrice=199999/);
  await page.getByRole("status").filter({ hasText: "3 finds" }).waitFor();
  await page.getByRole("button", { name: "Remove price filter" }).click();
  await page.getByRole("status").filter({ hasText: "8 finds" }).waitFor();
  await goto("/");
  await page
    .getByText("Can I buy something in this preview?", { exact: true })
    .click();
  assert.match(
    await page.locator("details[open]").textContent(),
    /no payment is taken/,
  );
  await page
    .getByLabel("Search products, stores, or categories", { exact: true })
    .fill("botanical");
  await page
    .getByRole("button", { name: "Search the collection", exact: true })
    .click();
  await page.getByRole("status").filter({ hasText: "1 find" }).waitFor();
  await goto("/");
  await page
    .locator('main a[href="/products?category=fashion"]')
    .first()
    .click();
  await page.getByRole("heading", { name: "Fashion", exact: true }).waitFor();
  await page.getByRole("status").filter({ hasText: "2 finds" }).waitFor();
  assert.equal(await page.locator("main h3").count(), 2);
  await page.getByRole("link", { name: "Clear filters", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "8 finds" }).waitFor();
  await page.getByLabel("Sort by").selectOption("price_asc");
  await page.waitForURL(/sort=price_asc/);
  await page
    .getByRole("heading", { name: "The seasonal harvest basket" })
    .first()
    .waitFor();
  assert.equal(
    await page.locator("main h3").first().textContent(),
    "The seasonal harvest basket",
  );
  await page.getByLabel("Next page", { exact: true }).click();
  await page.waitForURL(/page=2/);
  await page.getByRole("button", { name: "Page 2", exact: true }).waitFor();
  await page.goBack();
  await page.waitForURL((u) => !u.searchParams.has("page"));
  await page.getByRole("button", { name: "Page 1", exact: true }).waitFor();
  await page
    .getByLabel("Search products, stores, or categories", { exact: true })
    .fill("not-a-product-12345");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page.getByRole("heading", { name: "No finds this time." }).waitFor();
  await page
    .getByRole("link", { name: "Explore all finds", exact: true })
    .click();
  await page.getByRole("status").filter({ hasText: "8 finds" }).waitFor();
  violations += await axe("catalog");
  await goto("/products/cotton-panjabi-set");
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await page.getByRole("button", { name: "Preview checkout" }).click();
  await page.waitForURL(/checkout.*qty=2/);
  await page
    .getByRole("heading", { name: "The final little details." })
    .waitFor();
  await page.getByRole("button", { name: "Use example details" }).click();
  violations += await axe("checkout details");
  await page.screenshot({
    path: "/tmp/shopstream-checkout.png",
    fullPage: true,
  });
  await page.getByLabel("Online payment", { exact: false }).check();
  await page.getByRole("button", { name: "Review sample order" }).click();
  await page.getByRole("heading", { name: "One last look." }).waitFor();
  assert.match(
    await page.locator('aside[aria-label="Order summary"]').textContent(),
    /4,380/,
  );
  assert.match(
    await page.locator("main").textContent(),
    /Online payment \(simulated\)/,
  );
  violations += await axe("checkout review");
  await page.getByRole("button", { name: "Edit details" }).click();
  assert.equal(
    await page.getByLabel("Full name", { exact: true }).inputValue(),
    "Demo Shopper",
  );
  await page.getByRole("button", { name: "Review sample order" }).click();
  await page.getByRole("button", { name: "Finish demo checkout" }).click();
  await page
    .getByRole("heading", { name: "You’ve tried the checkout." })
    .waitFor();
  assert.equal(
    await page.evaluate(
      () =>
        Object.keys(localStorage).filter(
          (k) => k.includes("order") || k.includes("address"),
        ).length,
    ),
    0,
  );
  await goto("/auth/login?next=%2Fcheckout%3Fproduct%3Dcotton-panjabi-set");
  await page.getByRole("link", { name: "Continue to demo checkout" }).waitFor();
  assert.equal(await page.locator("input[type=password]").count(), 0);
  violations += await axe("account demo");
  await page.getByRole("button", { name: "Open quick help" }).click();
  await page.getByRole("dialog").waitFor({ state: "visible" });
  await page.getByText("Is this a real shop?", { exact: true }).click();
  violations += await axe("quick help");
  await page.keyboard.press("Escape");
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  assert.equal(
    await page
      .getByRole("button", { name: "Open quick help" })
      .evaluate((el) => document.activeElement === el),
    true,
    "help restores focus",
  );
  await goto("/sell");
  violations += await axe("seller");
  await page.getByRole("link", { name: "Explore a sample store" }).click();
  await page.getByRole("heading", { name: "Bengal & Thread" }).waitFor();
  await page
    .getByRole("heading", { name: "The everyday cotton set" })
    .waitFor();
  violations += await axe("sample store");
  await page.setViewportSize({ width: 375, height: 812 });
  await goto("/");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Sign in", exact: true })
    .waitFor();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("navigation", { name: "Mobile navigation" }).waitFor();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Books", exact: true })
    .click();
  await page.getByRole("heading", { name: "Books", exact: true }).waitFor();
  for (const route of [
    "/",
    "/products",
    "/products/cotton-panjabi-set",
    "/checkout?product=cotton-panjabi-set",
    "/sell",
  ]) {
    await goto(route);
    await page.waitForTimeout(300);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
      false,
      `horizontal overflow ${route}`,
    );
    violations += await axe("mobile " + route);
  }
  await goto("/");
  await page.screenshot({
    path: "/tmp/shopstream-home-mobile.png",
    fullPage: true,
  });
  await page.emulateMedia({ colorScheme: "dark" });
  violations += await axe("home dark");
  await page.screenshot({
    path: "/tmp/shopstream-home-dark.png",
    fullPage: true,
  });
  await page.evaluate(() => {
    document.documentElement.dataset.theme = "light";
  });
  violations += await axe("home explicit light");
  await page.emulateMedia({ colorScheme: "light" });
  await page.evaluate(() => {
    document.documentElement.dataset.theme = "dark";
  });
  violations += await axe("home explicit dark");
  await page.evaluate(() => {
    delete document.documentElement.dataset.theme;
  });
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await goto("/");
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `homepage horizontal overflow at ${width}px`,
    );
  }
  assert.ok(
    await page
      .locator("footer h2")
      .first()
      .evaluate(
        (element) => parseFloat(getComputedStyle(element).fontSize) <= 14,
      ),
    "homepage display styles must not override footer headings",
  );
  console.log(
    JSON.stringify(
      {
        pageErrors: errors,
        failedResponses: missing,
        apiRequests: apis,
        violations,
      },
      null,
      2,
    ),
  );
  await browser.close();
  assert.equal(errors.length, 0, "browser exceptions");
  assert.equal(missing.length, 0, "failed asset responses");
  assert.equal(apis.length, 0, "no backend calls in demo");
  assert.equal(violations, 0, "axe violations");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
