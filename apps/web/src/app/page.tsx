// apps/web/src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { ProductCard } from "@/components/ProductCard";
import { Footer } from "@/components/Footer";
import { productApi, categoryApi } from "@/lib/api";
import type { PublicProductResponse, CategoryResponse } from "@/lib/types";

export default function HomePage() {
  const [flash, setFlash] = useState<PublicProductResponse[]>([]);
  const [latest, setLatest] = useState<PublicProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      productApi.flashSales(),
      productApi.list({ size: 8 }),
      categoryApi.list(),
    ]).then(([f, l, c]) => {
      if (cancelled) return;

      if (f.status === "fulfilled") setFlash(f.value.content);
      if (l.status === "fulfilled") setLatest(l.value.content);
      if (c.status === "fulfilled") setCategories(c.value);

      const failed = [f, l, c].filter((r) => r.status === "rejected");
      if (failed.length === 3) {
        setError("Backend এর সাথে connect করা যাচ্ছে না। Spring Boot চালু আছে কিনা দেখো।");
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-10">
        <div className="flex flex-col gap-5 flex-1">
          <h1
            className="text-4xl md:text-6xl font-bold leading-tight"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}
          >
            Shop without
            <br />
            <span className="text-[#E8F44A] bg-zinc-900 dark:bg-transparent px-2 rounded-lg">
              oversell
            </span>
          </h1>
          <p className="text-lg max-w-md" style={{ color: "var(--text-muted)" }}>
            Real-time inventory. Zero double bookings. Flash sales that actually end.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/products"
              className="px-6 py-3 rounded-full font-semibold text-sm bg-[#E8F44A] text-zinc-900 min-h-[44px] flex items-center"
            >
              Browse Products
            </Link>
            <Link
              href="/auth/register"
              className="px-6 py-3 rounded-full font-semibold text-sm border min-h-[44px] flex items-center"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}
            >
              Sell with us
            </Link>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 md:justify-end">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}`}
                className="px-4 py-2 rounded-full text-sm font-medium border transition-colors hover:border-[#E8F44A] hover:bg-[#E8F44A] hover:text-zinc-900"
                style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}
      </section>

      {error && (
        <div className="max-w-7xl mx-auto px-4 pb-8">
          <div
            className="rounded-2xl border p-5 text-sm"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
          >
            {error}
          </div>
        </div>
      )}

      {flash.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-12">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
              Flash Sales
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E8F44A] text-zinc-900">
              Live
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {flash.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
            Latest Products
          </h2>
          <Link href="/products" className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            View all →
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {latest.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}