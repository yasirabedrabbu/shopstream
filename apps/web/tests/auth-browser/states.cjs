/* eslint-disable @typescript-eslint/no-require-imports -- Optional browser suite. */
const assert = require("node:assert/strict");
module.exports = async function statesChecks({ page, go }) {
  const routes = ["login", "register", "forgot-password", "verify-email"];
  for (const route of routes) {
    await go(route);
    for (const state of ["loading", "error", "success", "default"]) {
      await page.getByLabel("Authentication state preview", { exact: true }).selectOption(state);
      await page.locator(`[data-auth-state="${state}"]`).waitFor();
      if (state === "loading") assert.ok(await page.locator('button[aria-busy="true"]').isDisabled());
      if (state === "success") await page.locator(".a-success").waitFor();
      if (state === "error") await page.locator(".a-form-error").waitFor();
    }
    await page.screenshot({
      path: "/tmp/auth-" + route + "-desktop.png",
      fullPage: true,
    });
  }
  console.log("All four routes and default/loading/error/success states passed.");
};
