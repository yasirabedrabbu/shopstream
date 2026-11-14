"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { productApi, type ProductListParams } from "@/lib/api";
import { DEMO_CATEGORIES, DEMO_MODE } from "@/lib/demo";
import { formatMoney } from "@/lib/money";
import { Icon } from "@/components/ui/Icon";
import { buttonClasses } from "@/components/ui/Button";
import type { Page, PublicProductResponse } from "@/lib/types";

const sorts = [
  { value: "newest", label: "Featured finds" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "name", label: "Name: A–Z" },
];

function ProductSkeletons() {
  return (
    <div
      role="status"
      className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6"
    >
      <span className="sr-only">Loading products</span>
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className="aspect-[3/4] animate-pulse rounded-xl bg-surface"
        />
      ))}
    </div>
  );
}

function ProductsContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const q = sp.get("q") ?? "";
  const category = sp.get("category") ?? "";
  const rawMaxPrice = Number(sp.get("maxPrice"));
  const maxPrice =
    Number.isSafeInteger(rawMaxPrice) && rawMaxPrice > 0
      ? rawMaxPrice
      : undefined;
  const priceLabel =
    maxPrice === 199999
      ? "Under ৳2,000"
      : maxPrice
        ? `Up to ${formatMoney(maxPrice, "BDT")}`
        : "";
  const requestedSort = sp.get("sort") ?? "newest";
  const sort = (
    sorts.some((s) => s.value === requestedSort) ? requestedSort : "newest"
  ) as ProductListParams["sort"];
  const page = Math.max(
    0,
    (Number.parseInt(sp.get("page") ?? "1", 10) || 1) - 1,
  );
  const [result, setResult] = useState<Page<PublicProductResponse> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const selectedCategory = DEMO_CATEGORIES.find((c) => c.slug === category);

  function navigate(updates: Record<string, string>) {
    const params = new URLSearchParams(sp.toString());
    if (!("page" in updates)) params.delete("page");
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`/products${params.size ? `?${params.toString()}` : ""}`, {
      scroll: false,
    });
  }
  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate({
      q: String(new FormData(event.currentTarget).get("q") ?? "").trim(),
    });
  }

  useEffect(() => {
    let active = true;
    productApi
      .list({ q, category, sort, page, maxPrice, size: 6 })
      .then((data) => {
        if (active) setResult(data);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [q, category, sort, page, maxPrice, attempt]);

  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <nav aria-label="Breadcrumb" className="mb-5 text-xs text-text-muted">
            <Link className="inline-flex min-h-9 items-center" href="/">
              Home
            </Link>
            <span aria-hidden="true" className="mx-2">
              /
            </span>
            <span>Shop</span>
          </nav>
          <p className="eyebrow mb-3 text-text-muted">
            Good things, all together
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {selectedCategory ? selectedCategory.name : "Shop all finds"}
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-text-muted">
            Everyday essentials and unexpected favorites from independent
            stores.
          </p>
        </div>
        {DEMO_MODE && (
          <p className="w-fit rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-muted">
            Sample collection · No live inventory
          </p>
        )}
      </div>
      <form
        onSubmit={search}
        role="search"
        className="mb-6 flex max-w-2xl gap-2"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-border bg-surface px-4 focus-within:ring-2 focus-within:ring-[var(--focus)]">
          <Icon name="search" className="shrink-0 text-text-muted" />
          <label htmlFor="product-search" className="sr-only">
            Search products, stores, or categories
          </label>
          <input
            id="product-search"
            key={q}
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search products, stores, or categories"
            className="h-12 min-w-0 flex-1 bg-transparent text-base outline-none"
          />
        </div>
        <button
          type="submit"
          className={buttonClasses({ className: "min-h-12 px-4" })}
        >
          Search
        </button>
      </form>
      <div
        aria-label="Filter by category"
        className="mb-7 flex flex-wrap gap-2"
      >
        {[{ id: "all", name: "All finds", slug: "" }, ...DEMO_CATEGORIES].map(
          (c) => (
            <button
              key={c.id}
              onClick={() => navigate({ category: c.slug })}
              aria-pressed={category === c.slug}
              className={`min-h-11 rounded-full border px-4 text-sm transition-colors ${category === c.slug ? "border-text bg-text text-bg" : "border-border text-text-muted hover:border-text hover:text-text"}`}
            >
              {c.name}
            </button>
          ),
        )}
      </div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
        <p role="status" aria-live="polite" className="text-sm text-text-muted">
          {loading
            ? "Finding your next favorite…"
            : error
              ? "Products unavailable"
              : `${result?.totalElements ?? 0} ${(result?.totalElements ?? 0) === 1 ? "find" : "finds"}${q ? ` for “${q}”` : ""}`}
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm text-text-muted">
            Sort by
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => navigate({ sort: e.target.value })}
            className="min-h-11 max-w-[190px] rounded-lg border border-border bg-bg px-3 text-sm text-text"
          >
            {sorts.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {(q || category || maxPrice) && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {q && (
            <button
              onClick={() => navigate({ q: "" })}
              className="flex min-h-11 items-center gap-2 rounded-lg bg-surface px-3 text-sm"
              aria-label={`Remove search ${q}`}
            >
              “{q}” <Icon name="close" size={14} />
            </button>
          )}
          {category && (
            <button
              onClick={() => navigate({ category: "" })}
              className="flex min-h-11 items-center gap-2 rounded-lg bg-surface px-3 text-sm"
              aria-label="Remove category filter"
            >
              {selectedCategory?.name ?? category}{" "}
              <Icon name="close" size={14} />
            </button>
          )}
          {maxPrice && (
            <button
              onClick={() => navigate({ maxPrice: "" })}
              className="flex min-h-11 items-center gap-2 rounded-lg bg-surface px-3 text-sm"
              aria-label="Remove price filter"
            >
              {priceLabel}
              <Icon name="close" size={14} />
            </button>
          )}
          <Link
            href="/products"
            className="inline-flex min-h-11 items-center px-3 text-sm text-text-muted underline underline-offset-4"
          >
            Clear filters
          </Link>
        </div>
      )}
      {loading ? (
        <ProductSkeletons />
      ) : error ? (
        <div
          role="alert"
          className="rounded-xl border border-border bg-surface p-10 text-center"
        >
          <Icon name="alert" size={28} className="mx-auto mb-4" />
          <h2 className="text-xl font-semibold">
            A little trouble finding your finds.
          </h2>
          <p className="mt-3 text-sm text-text-muted">
            The collection couldn’t load. Your filters have been kept.
          </p>
          <button
            onClick={() => {
              setLoading(true);
              setError(false);
              setAttempt((a) => a + 1);
            }}
            className={buttonClasses({
              variant: "secondary",
              className: "mt-5",
            })}
          >
            Try again
          </button>
        </div>
      ) : result?.content.length ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
          {result.content.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface px-6 py-16 text-center">
          <Icon
            name="search"
            size={30}
            className="mx-auto mb-5 text-text-muted"
          />
          <h2 className="text-xl font-semibold">No finds this time.</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-text-muted">
            Try a different search, choose another category, or explore the full
            collection.
          </p>
          <Link
            href="/products"
            className={buttonClasses({ className: "mt-6" })}
          >
            Explore all finds <Icon name="arrowRight" size={16} />
          </Link>
        </div>
      )}
      {!loading && !error && result && result.totalPages > 1 && (
        <nav
          aria-label="Product pages"
          className="mt-10 flex flex-wrap items-center justify-center gap-2"
        >
          <button
            disabled={page === 0}
            onClick={() => navigate({ page: String(page) })}
            className="min-h-11 rounded-xl border border-border px-3 text-sm disabled:opacity-40"
            aria-label="Previous page"
          >
            <Icon name="arrowLeft" size={17} />
          </button>
          {Array.from({ length: result.totalPages }, (_, i) => (
            <button
              key={i}
              aria-label={`Page ${i + 1}`}
              aria-current={i === page ? "page" : undefined}
              onClick={() => navigate({ page: String(i + 1) })}
              className={`h-11 min-w-11 rounded-xl border px-3 text-sm ${i === page ? "border-text bg-text text-bg" : "border-border"}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={page >= result.totalPages - 1}
            onClick={() => navigate({ page: String(page + 2) })}
            className="min-h-11 rounded-xl border border-border px-3 text-sm disabled:opacity-40"
            aria-label="Next page"
          >
            <Icon name="arrowRight" size={17} />
          </button>
        </nav>
      )}
    </>
  );
}

function KeyedProductsContent() {
  const params = useSearchParams();
  return <ProductsContent key={params.toString()} />;
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Nav />
      <main
        id="main-content"
        tabIndex={-1}
        className="page-width pb-12 pt-6 md:pt-10"
      >
        <Suspense fallback={<ProductSkeletons />}>
          <KeyedProductsContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
