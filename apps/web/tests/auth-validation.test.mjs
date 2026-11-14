import test from "node:test";
import assert from "node:assert/strict";
import { validEmail, validBangladeshPhone, validateLogin } from "../lib/auth-pages/model.ts";
test("auth email and Bangladesh phone validation rejects malformed values", () => {
  assert.ok(validEmail(" hello@example.com "));
  for (const v of ["", "hello", "a@b", "a b@c.com"]) assert.equal(validEmail(v), false);
  assert.ok(validBangladeshPhone("01712345678"));
  for (const v of ["01212345678", "0171234567", "+8801712345678"])
    assert.equal(validBangladeshPhone(v), false);
  assert.deepEqual(validateLogin("hello@example.com", "password"), {});
  assert.equal(Object.keys(validateLogin("invalid", "")).length, 2);
});
