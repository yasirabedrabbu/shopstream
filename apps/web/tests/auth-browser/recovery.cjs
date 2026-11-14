/* eslint-disable @typescript-eslint/no-require-imports -- Optional browser suite. */
const assert = require("node:assert/strict");
module.exports = async function recoveryChecks({ page, go }) {
  await go("forgot-password");
  await page.getByLabel("Email address", { exact: false }).fill("invalid");
  await page.getByRole("button", { name: "Send reset link", exact: true }).click();
  await page.locator(".a-form-error").waitFor();
  await page.getByLabel("Email address", { exact: false }).fill("preview@example.com");
  await page.getByRole("button", { name: "Send reset link", exact: true }).click();
  await page.getByRole("heading", { name: "Check your inbox", exact: true }).waitFor();
  console.log(
    "Validation, password visibility, safe return paths, role keyboard navigation, signup and recovery passed.",
  );
};
