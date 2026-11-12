// apps/web/src/app/products/[slug]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Badge } from "@/components/Badge";
import { productApi, orderApi } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { formatMoney, formatDate } from "@/lib/money";
import { useToast } from "@/components/Toast";
import type { PublicProductResponse } from "@/lib/types";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const [product, setProduct] = useState<PublicProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [ordering, setOrdering] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    productApi
      .get(slug)
      .then(setProduct)
      .catch(() => router.push("/products"))
      .finally(() => setLoading(false));
  }, [slug, router]);

  async function handleOrder() {
    if (!isLoggedIn()) {
      router.push("/auth/login");
      return;
    }
    if (!product) return;
    setOrdering(true);
    try {
      const order = await orderApi.create([
        { productId: product.id, quantity: qty },
      ]);
      toast("Order created!", "success");
      router.push(`/account/orders/${order.id}`);
    } catch {
      toast("Failed to create order. Try again.", "error");
    } finally {
      setOrdering(false);
    }
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

  const isFlash =
    product.salePriceCents !== null &&
    product.saleEndsAt !== null &&
    new Date(product.saleEndsAt) > new Date();

  const displayPrice = isFlash ? product.salePriceCents! : product.priceCents;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />
      <main className="max-w-7xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
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
            <div
              className="aspect-square rounded-2xl overflow-hidden"
              style={{ background: "var(--surface)" }}
            >
              {product.imageUrls?.[imgIndex] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrls[imgIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm">
                  No image
                </div>
              )}
            </div>
            {product.imageUrls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.imageUrls.map((url, i) => (
                  <button
                    key={i}
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
                href={`/stores/${product.storeSlug}`}
                className="text-sm mb-1 hover:underline"
                style={{ color: "var(--text-muted)" }}
              >
                {product.storeName}
              </Link>
              <h1
                className="text-2xl md:text-3xl font-bold"
                style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}
              >
                {product.name}
              </h1>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span
                className="text-3xl font-bold"
                style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}
              >
                {formatMoney(displayPrice, product.currency)}
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
              <p className="text-sm text-amber-500">
                Sale ends {formatDate(product.saleEndsAt)}
              </p>
            )}

            {/* Stock */}
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {product.stockQuantity > 10
                ? "In stock"
                : product.stockQuantity > 0
                ? `Only ${product.stockQuantity} left`
                : "Out of stock"}
            </p>

            {/* Category */}
            <div className="flex items-center gap-2">
              <Link
                href={`/products?category=${product.categoryName.toLowerCase()}`}
                className="text-xs px-3 py-1 rounded-full border"
                style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
              >
                {product.categoryName}
              </Link>
            </div>

            {/* Qty + Order */}
            {product.status === "ACTIVE" && product.stockQuantity > 0 && (
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center border rounded-xl overflow-hidden"
                  style={{ borderColor: "var(--border)" }}
                >
                  <button
                    onClick={() => setQty((v) => Math.max(1, v - 1))}
                    className="w-10 h-11 flex items-center justify-center text-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    style={{ color: "var(--text)" }}
                  >
                    −
                  </button>
                  <span
                    className="w-10 text-center text-sm font-semibold"
                    style={{ color: "var(--text)" }}
                  >
                    {qty}
                  </span>
                  <button
                    onClick={() =>
                      setQty((v) => Math.min(product.stockQuantity, v + 1))
                    }
                    className="w-10 h-11 flex items-center justify-center text-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    style={{ color: "var(--text)" }}
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleOrder}
                  disabled={ordering}
                  className="flex-1 h-11 rounded-xl bg-[#E8F44A] text-zinc-900 font-semibold text-sm disabled:opacity-60 transition-opacity"
                >
                  {ordering ? "Placing order..." : "Order Now"}
                </button>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                <h3
                  className="text-sm font-semibold mb-2"
                  style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}
                >
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