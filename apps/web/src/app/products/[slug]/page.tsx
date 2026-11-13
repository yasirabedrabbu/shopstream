// apps/web/src/app/products/[slug]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Badge } from "@/components/Badge";
import { productApi } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { formatMoney, formatDate } from "@/lib/money";
import type { PublicProductResponse } from "@/lib/types";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<PublicProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    productApi
      .get(slug)
      .then(setProduct)
      .catch(() => router.push("/products"))
      .finally(() => setLoading(false));
  }, [slug, router]);

  function handleOrder() {
    if (!product) return;
    if (!isLoggedIn()) {
      router.push("/auth/login");
      return;
    }
    router.push(`/checkout?product=${product.slug}&qty=${qty}`);
  }

  if (loading) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <Nav />
        <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10">
          <div className="aspect-square rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />
          <div className="flex flex-col gap-4">
            {[200, 120, 80, 48].map((w, i) => (
              <div key={i} className="h-6 rounded-lg animate-pulse" style={{ background: "var(--surface)", width: w }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const isFlash = product.flashSaleActive;
  const images = product.imageUrls ?? [];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />
      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex gap-2 text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/products">Products</Link>
          <span>/</span>
          <span style={{ color: "var(--text)" }}>{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Images */}
          <div className="flex flex-col gap-3">
            <div className="aspect-square rounded-2xl overflow-hidden" style={{ background: "var(--surface)" }}>
              {images[imgIndex] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={images[imgIndex]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm">
                  No image
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((url, i) => (
                  <button
                    key={url}
                    onClick={() => setImgIndex(i)}
                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                      i === imgIndex ? "border-[#E8F44A]" : "border-transparent"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5">
            <div>
              <Link
                href={`/stores/${product.store.slug}`}
                className="text-sm mb-1 hover:underline"
                style={{ color: "var(--text-muted)" }}
              >
                {product.store.storeName}
              </Link>
              <h1
                className="text-2xl md:text-3xl font-bold"
                style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}
              >
                {product.name}
              </h1>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
                {formatMoney(product.effectivePriceCents, product.currency)}
              </span>
              {isFlash && (
                <>
                  <span className="text-lg line-through" style={{ color: "var(--text-muted)" }}>
                    {formatMoney(product.priceCents, product.currency)}
                  </span>
                  <Badge variant="accent">Flash Sale</Badge>
                </>
              )}
            </div>
            {isFlash && product.saleEndsAt && (
              <p className="text-sm text-amber-500">Sale ends {formatDate(product.saleEndsAt)}</p>
            )}

            <p className="text-sm" style={{ color: product.inStock ? "var(--text-muted)" : "#ef4444" }}>
              {product.inStock ? "In stock" : "Out of stock"}
            </p>

            <div className="flex items-center gap-2">
              <Link
                href={`/products?category=${product.category.slug}`}
                className="text-xs px-3 py-1 rounded-full border"
                style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
              >
                {product.category.name}
              </Link>
            </div>

            {product.inStock && (
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-xl overflow-hidden" style={{ borderColor: "var(--border)" }}>
                  <button
                    onClick={() => setQty((v) => Math.max(1, v - 1))}
                    className="w-10 h-11 flex items-center justify-center text-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    style={{ color: "var(--text)" }}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-semibold" style={{ color: "var(--text)" }}>
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((v) => Math.min(100, v + 1))}
                    className="w-10 h-11 flex items-center justify-center text-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    style={{ color: "var(--text)" }}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleOrder}
                  className="flex-1 h-11 rounded-xl bg-[#E8F44A] text-zinc-900 font-semibold text-sm"
                >
                  Order Now
                </button>
              </div>
            )}

            {product.description && (
              <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                <h3 className="text-sm font-semibold mb-2" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
                  Description
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}