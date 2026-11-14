import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
test("auth export includes eight frames, four states, shared brand tokens and exact dimensions", () => {
  const spec = JSON.parse(readFileSync("public/auth-design/shopstream-auth-design-spec.json", "utf8"));
  assert.equal(spec.frames.length, 8);
  assert.equal(new Set(spec.frames.map((f) => f.route)).size, 4);
  assert.ok(spec.frames.every((f) => f.states.length === 4));
  assert.ok(spec.frames.filter((f) => f.variant === "Mobile").every((f) => f.width === 375));
  assert.equal(spec.variables.dimensions["form-max"], 400);
  assert.equal(spec.components.RoleCard.width, 100);
  assert.equal(spec.components.OTPBox.height, 56);
  assert.equal(spec.components.ResendCode.cooldown, 60);
  assert.equal(spec.variables.brandPanel.background, "#111114");
  assert.ok(spec.format.includes("not a native"));
});
