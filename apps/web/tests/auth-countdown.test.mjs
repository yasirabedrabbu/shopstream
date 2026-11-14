import test from "node:test";
import assert from "node:assert/strict";
import { remainingSeconds, countdownLabel } from "../lib/auth-pages/model.ts";
test("resend countdown handles exact boundaries and never goes negative", () => {
  assert.equal(remainingSeconds(60000, 0), 60);
  assert.equal(remainingSeconds(60000, 59001), 1);
  assert.equal(remainingSeconds(60000, 60000), 0);
  assert.equal(remainingSeconds(60000, 90000), 0);
  assert.equal(countdownLabel(60), "01:00");
  assert.equal(countdownLabel(9), "00:09");
  assert.equal(countdownLabel(-1), "00:00");
});
