import test from "node:test";
import assert from "node:assert/strict";
import { normalizeOtp, applyOtpInput } from "../lib/auth-pages/model.ts";
test("OTP supports Bangla digits, paste, overwrite, clear and bounded advance", () => {
  assert.equal(normalizeOtp("১২৩ ৪৫৬ 7"), "123456");
  const empty = Array(6).fill("");
  assert.deepEqual(applyOtpInput(empty, "123456", 4), {
    digits: ["1", "2", "3", "4", "5", "6"],
    nextIndex: 5,
  });
  assert.deepEqual(applyOtpInput(empty, "8", 0), {
    digits: ["8", "", "", "", "", ""],
    nextIndex: 1,
  });
  assert.deepEqual(applyOtpInput(["1", "2", "3", "4", "5", "6"], "", 2).digits, [
    "1",
    "2",
    "",
    "4",
    "5",
    "6",
  ]);
  assert.deepEqual(applyOtpInput(empty, "789", 4), {
    digits: ["", "", "", "", "7", "8"],
    nextIndex: 5,
  });
});
