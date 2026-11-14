/* eslint-disable @typescript-eslint/no-require-imports -- Optional browser suite. */
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const checks = ["states", "login", "registration", "recovery", "otp", "responsive"];
const base = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
    args: ["--no-sandbox"],
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    async function go(route) {
      const response = await page.goto(base + "/auth/" + route);
      assert.equal(response.status(), 200);
      await page.locator("h1").waitFor();
    }
    for (const name of checks) await require("./auth-browser/" + name + ".cjs")({ page, go });
    assert.deepEqual(errors, []);
    console.log("All authentication browser checks passed.");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
