/* eslint-disable @typescript-eslint/no-require-imports -- Optional browser suite. */
const assert = require("node:assert/strict");
module.exports = async function responsiveChecks({ page, go }) {
  const routes = ["login", "register", "forgot-password", "verify-email"];
  const digit = (i) => page.getByLabel("Verification digit " + i, { exact: true });
  for (const width of [1440, 1024, 768, 375, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await go(route);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
        `${route} overflow at ${width}`,
      );
      assert.ok((await page.locator(".a-form-container").boundingBox()).width <= 400);
      if (width < 1024) assert.equal(await page.locator(".a-brand-panel").isVisible(), false);
    }
    console.log("Responsive/no-overflow:", width);
  }
  await page.setViewportSize({ width: 375, height: 900 });
  await go("register");
  assert.equal(
    await page.locator('button[aria-label="Open help assistant"]').isVisible(),
    false,
    "Mobile authentication CTA must not be covered by the global help launcher",
  );
  const box = await page.getByRole("radio", { name: "Buyer", exact: true }).boundingBox();
  assert.equal(box.width, 100);
  assert.equal(box.height, 80);
  await page.screenshot({
    path: "/tmp/auth-register-mobile.png",
    fullPage: true,
  });
  await go("verify-email");
  const otp = await digit(1).boundingBox();
  assert.equal(otp.width, 48);
  assert.equal(otp.height, 56);
  await page.screenshot({
    path: "/tmp/auth-verify-mobile.png",
    fullPage: true,
  });
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page
      .getByRole("button", {
        name: "Download authentication design specification",
        exact: true,
      })
      .click(),
  ]);
  assert.equal(download.suggestedFilename(), "shopstream-auth-design-spec.json");
};
