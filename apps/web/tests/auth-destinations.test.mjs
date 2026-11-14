import test from "node:test";
import assert from "node:assert/strict";
import { demoDestination, liveDestination } from "../lib/auth-pages/model.ts";
test("existing role destinations remain distinct from preview workspaces", () => {
  assert.equal(demoDestination("Buyer"), "/account/overview");
  assert.equal(demoDestination("Seller"), "/workspace/overview");
  assert.equal(liveDestination("ADMIN"), "/admin/dashboard");
  assert.equal(liveDestination("VENDOR"), "/vendor/dashboard");
  assert.equal(liveDestination("CUSTOMER"), "/");
});
