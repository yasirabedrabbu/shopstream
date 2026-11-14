/* eslint-disable @typescript-eslint/no-require-imports -- Optional browser suite. */
const assert = require("node:assert/strict");
module.exports = async function loginChecks({ page, go }) {
  await go("login?next=%2Faccount%2Forders");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.locator(".a-form-error").waitFor();
  assert.equal(await page.locator('input[aria-invalid="true"]').count(), 2);
  await page.getByLabel("Email address", { exact: false }).fill("preview@example.com");
  await page.locator(".a-password-field input").fill("SamplePassword12!");
  await page.getByRole("button", { name: "Show password", exact: true }).click();
  assert.equal(await page.locator(".a-password-field input").getAttribute("type"), "text");
  await page.getByRole("button", { name: "Hide password", exact: true }).click();
  assert.equal(await page.locator(".a-password-field input").getAttribute("type"), "password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.getByRole("heading", { name: "You’re all set", exact: true }).waitFor();
  assert.equal(
    await page.getByRole("link", { name: "Explore the dashboard", exact: true }).getAttribute("href"),
    "/account/orders",
  );
  assert.equal(await page.evaluate(() => localStorage.getItem("accessToken")), null);
};
