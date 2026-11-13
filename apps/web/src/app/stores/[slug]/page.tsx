// apps/web/src/app/stores/[slug]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { ProductCard } from "@/components/ProductCard";
import { storeApi } from "@/lib/api";
import type { StoreResponse, PublicProductResponse } from "@/lib/types";

export default function StoreDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [store, setStore] = useState<StoreResponse | null>(null);
  const [products, setProducts] = useState<PublicProductResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([storeApi.get(slug), storeApi.products(slug)])
      .then(([s, p]) => {
        setStore(s);
        setProducts(p.content);
      })
      .catch(() => router.push("/products"))
      .finally(() => setLoading(false));
  }, [slug, router]);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />
      <main className="max-w-7xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex flex-col gap-6">
            <div className="h-28 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />
              ))}
            </div>
          </div>
        ) : store ? (
          <>
            {/* Store header */}
            <div
              className="rounded-2xl border p-6 mb-8 flex items-center gap-5"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0"
                style={{ background: "#E8F44A", color: "#18181b" }}
              >
                {store.name[0]}
              </div>
              <div>
                <h1
                  className="text-xl font-bold"
                  style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}
                >
                  {store.name}
                </h1>
                {store.description && (
                  <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                    {store.description}
                  </p>
                )}
              </div>
            </div>

            {/* Products */}
            <h2
              className="text-lg font-bold mb-5"
              style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}
            >
              Products ({products.length})
            </h2>
            {products.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>No products listed yet.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}