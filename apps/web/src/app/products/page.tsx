// apps/web/src/app/products/page.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Nav } from "@/components/Nav";
import { ProductCard } from "@/components/ProductCard";
import { productApi, categoryApi } from "@/lib/api";
import type { PublicProductResponse, CategoryResponse } from "@/lib/types";

export default function ProductsPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const [products, setProducts] = useState<PublicProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const q = sp.get("q") ?? "";
  const category = sp.get("category") ?? "";

  const [search, setSearch] = useState(q);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const load = useCallback(
    (p: number) => {
      setLoading(true);
      productApi
        .list({ page: p, size: 16, q: q || undefined, category: category || undefined })
        .then((data) => {
          setProducts(data.content);
          setTotalPages(data.totalPages);
          setPage(p);
        })
        .finally(() => setLoading(false));
    },
    [q, category],
  );

  useEffect(() => {
    categoryApi.list().then(setCategories);
  }, []);

  useEffect(() => {
    load(0);
  }, [load]);

  function handleSearch(val: string) {
    setSearch(val);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (val) params.set("q", val);
      if (category) params.set("category", category);
      router.push(`/products?${params.toString()}`);
    }, 400);
  }

  function handleCategory(slug: string) {
    const params = new URLSearchParams();
    if (slug) params.set("category", slug);
    if (q) params.set("q", q);
    router.push(`/products?${params.toString()}`);
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 h-11 px-4 rounded-xl border text-sm outline-none focus:border-[#E8F44A]"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          />
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => handleCategory("")}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                !category ? "bg-[#E8F44A] text-zinc-900 border-[#E8F44A]" : ""
              }`}
              style={
                category
                  ? { borderColor: "var(--border)", color: "var(--text-muted)" }
                  : {}
              }
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => handleCategory(c.slug)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  category === c.slug ? "bg-[#E8F44A] text-zinc-900 border-[#E8F44A]" : ""
                }`}
                style={
                  category !== c.slug
                    ? { borderColor: "var(--border)", color: "var(--text-muted)" }
                    : {}
                }
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl animate-pulse"
                style={{ background: "var(--surface)" }}
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24" style={{ color: "var(--text-muted)" }}>
            No products found.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => load(i)}
                className={`w-9 h-9 rounded-full text-sm font-medium border transition-colors ${
                  i === page ? "bg-[#E8F44A] text-zinc-900 border-[#E8F44A]" : ""
                }`}
                style={
                  i !== page
                    ? { borderColor: "var(--border)", color: "var(--text)" }
                    : {}
                }
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}