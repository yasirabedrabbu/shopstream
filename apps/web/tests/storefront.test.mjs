import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import {
  DEMO_PRODUCTS,
  DEMO_CATEGORIES,
  DEMO_STORES,
  listDemoProducts,
  safeReturnPath,
} from "../lib/demo.ts";

test("every category has sample products and a local image", () => {
  for (const category of DEMO_CATEGORIES) {
    const result = listDemoProducts({ category: category.slug });
    assert.ok(result.totalElements > 0);
    assert.ok(
      result.content.every(
        (product) => product.category.slug === category.slug,
      ),
    );
    assert.ok(existsSync(`public/images/cat-${category.slug}.webp`));
  }
});

test("search includes products, stores, and categories without case sensitivity", () => {
  assert.equal(
    listDemoProducts({ q: "  BOTANICAL  " }).content[0].slug,
    "botanical-perfume",
  );
  assert.equal(listDemoProducts({ q: "bengal & thread" }).totalElements, 2);
  assert.ok(
    listDemoProducts({ q: "books" }).content.every(
      (product) => product.category.slug === "books",
    ),
  );
  assert.equal(
    listDemoProducts({ q: "no-matching-product-here" }).totalElements,
    0,
  );
});

test("store, search, category, and price filters combine", () => {
  assert.equal(
    listDemoProducts({
      store: "bengal-thread",
      category: "fashion",
      minPrice: 250000,
    }).totalElements,
    1,
  );
  assert.equal(
    listDemoProducts({ q: "cotton", category: "books" }).totalElements,
    0,
  );
  for (const store of DEMO_STORES)
    assert.ok(listDemoProducts({ store: store.slug }).totalElements > 0);
});

test("the homepage budget edit contains only finds below 2,000 taka", () => {
  const edit = listDemoProducts({ maxPrice: 199999, sort: "price_asc" });
  assert.equal(edit.totalElements, 3);
  assert.ok(
    edit.content.every((product) => product.effectivePriceCents < 200000),
  );
});

test("sort and pagination are deterministic and do not mutate source data", () => {
  const original = DEMO_PRODUCTS.map((p) => p.slug);
  const ascending = listDemoProducts({ sort: "price_asc" }).content.map(
    (p) => p.effectivePriceCents,
  );
  assert.deepEqual(
    ascending,
    [...ascending].sort((a, b) => a - b),
  );
  const descending = listDemoProducts({ sort: "price_desc" }).content.map(
    (p) => p.effectivePriceCents,
  );
  assert.deepEqual(
    descending,
    [...descending].sort((a, b) => b - a),
  );
  const first = listDemoProducts({ page: 0, size: 6 });
  const second = listDemoProducts({ page: 1, size: 6 });
  assert.equal(first.totalPages, 2);
  assert.equal(first.content.length, 6);
  assert.equal(second.content.length, 2);
  assert.equal(
    new Set([...first.content, ...second.content].map((p) => p.slug)).size,
    8,
  );
  assert.deepEqual(
    DEMO_PRODUCTS.map((p) => p.slug),
    original,
  );
});

test("sample prices are positive integer minor units with consistent sale state", () => {
  for (const product of DEMO_PRODUCTS) {
    assert.ok(Number.isInteger(product.priceCents) && product.priceCents > 0);
    assert.ok(product.effectivePriceCents <= product.priceCents);
    assert.equal(product.flashSaleActive, product.salePriceCents !== null);
    assert.ok(existsSync(`public${product.imageUrls[0]}`));
  }
});

test("return destinations allow internal paths but reject external and malformed redirects", () => {
  assert.equal(
    safeReturnPath("/checkout?product=cotton-panjabi-set&qty=2"),
    "/checkout?product=cotton-panjabi-set&qty=2",
  );
  for (const value of [
    null,
    "",
    "https://example.com",
    "//example.com",
    "/\\example.com",
    "/\nexample.com",
    "javascript:alert(1)",
  ]) {
    assert.equal(safeReturnPath(value), null);
  }
});
