/* eslint-disable @typescript-eslint/no-require-imports -- Optional browser suite. */
const assert = require("node:assert/strict");
module.exports = async function otpChecks({ page, go }) {
  await page.clock.install();
  await go("verify-email");
  const digit = (i) => page.getByLabel("Verification digit " + i, { exact: true });
  await page.getByRole("button", { name: "Verify", exact: true }).click();
  await page.locator(".a-form-error").waitFor();
  await digit(1).fill("1");
  assert.ok(await digit(2).evaluate((el) => el === document.activeElement));
  await digit(2).fill("2");
  await digit(3).press("Backspace");
  assert.equal(await digit(2).inputValue(), "");
  await digit(2).press("End");
  assert.ok(await digit(6).evaluate((el) => el === document.activeElement));
  await digit(6).press("Home");
  assert.ok(await digit(1).evaluate((el) => el === document.activeElement));
  // A browser ClipboardEvent exercises the actual group paste handler.
  await digit(4).evaluate((el) => {
    const clipboardData = new DataTransfer();
    clipboardData.setData("text", "৬৫৪৩২১");
    el.dispatchEvent(
      new ClipboardEvent("paste", {
        bubbles: true,
        cancelable: true,
        clipboardData,
      }),
    );
  });
  assert.deepEqual(await page.locator(".a-otp-box input").evaluateAll((els) => els.map((el) => el.value)), [
    "6",
    "5",
    "4",
    "3",
    "2",
    "1",
  ]);
  await page.getByRole("button", { name: "Verify", exact: true }).click();
  await page.clock.runFor(900);
  await page
    .getByText("That code doesn’t match. In this preview, use 123456.", {
      exact: true,
    })
    .waitFor();
  const resend = page.getByRole("button", { name: "Resend code", exact: true });
  assert.ok(await resend.isDisabled());
  await page.clock.runFor(61000);
  assert.equal(await resend.isDisabled(), false);
  await resend.click();
  await page.clock.runFor(800);
  await page
    .getByText("Preview code refreshed. Use 123456; no email was sent.", {
      exact: true,
    })
    .waitFor();
  assert.ok(await resend.isDisabled());
  await digit(1).fill("123456");
  await page.getByRole("button", { name: "Verify", exact: true }).click();
  await page.clock.runFor(900);
  await page.getByRole("heading", { name: "Email verification complete", exact: true }).waitFor();
  await page.clock.resume();
  console.log(
    "OTP auto-advance, deletion, keyboard navigation, Bangla paste, wrong code, success and 60-second resend passed.",
  );
};
