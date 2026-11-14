/* eslint-disable @typescript-eslint/no-require-imports -- Optional browser suite. */
const assert = require("node:assert/strict");
module.exports = async function registrationChecks({ page, go }) {
  await go("register");
  await page.getByRole("radio", { name: "Buyer", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(
    await page.getByRole("radio", { name: "Seller", exact: true }).getAttribute("aria-checked"),
    "true",
  );
  await page.keyboard.press("End");
  assert.equal(
    await page.getByRole("radio", { name: "Business", exact: true }).getAttribute("aria-checked"),
    "true",
  );
  await page.getByRole("button", { name: "Create account", exact: true }).click();
  assert.equal(await page.locator('input[aria-invalid="true"]').count(), 5);
  await page.getByLabel("Full name", { exact: false }).fill("Sample Seller");
  await page.getByLabel("Email address", { exact: false }).fill("seller@example.com");
  await page.getByLabel("Phone number", { exact: false }).fill("01712345678");
  await page.locator(".a-password-field input").fill("SamplePassword12!");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Create account", exact: true }).click();
  await page.getByRole("heading", { name: "A good beginning", exact: true }).waitFor();
  await page
    .getByRole("link", {
      name: "Continue to verification preview",
      exact: true,
    })
    .click();
  await page.getByText("seller@example.com", { exact: true }).waitFor();
};
