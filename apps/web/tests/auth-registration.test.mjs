import test from "node:test";
import assert from "node:assert/strict";
import { passwordStrength, validateRegistration } from "../lib/auth-pages/model.ts";
test("registration enforces required fields, password strength and agreement", () => {
  const valid = {
    name: "Nabila Noor",
    email: "nabila@example.com",
    phone: "01712345678",
    password: "GoodSecret12!",
    terms: true,
  };
  assert.deepEqual(validateRegistration(valid), {});
  assert.equal(passwordStrength(valid.password), 4);
  assert.equal(
    Object.keys(
      validateRegistration({
        name: "",
        email: "",
        phone: "",
        password: "weak",
        terms: false,
      }),
    ).length,
    5,
  );
  assert.ok(validateRegistration({ ...valid, password: "12345678" }).password);
  assert.ok(validateRegistration({ ...valid, terms: false }).terms);
});
