"use client";

import { useEffect, useState } from "react";
import Image from "@/components/ui/SafeImage";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { productApi } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import type { PublicProductResponse } from "@/lib/types";

export default function WishlistPage() {
  const wishlist = useWishlist();
  const cart = useCart();
  const [products, setProducts] = useState<Record<string, PublicProductResponse | null>>({});
  const [loading, setLoading] = useState(true);

  const slugsKey = wishlist.slugs.join(",");

  useEffect(() => {
    let active = true;
    if (!wishlist.slugs.length) {
      setProducts({});
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(
      wishlist.slugs.map((slug) =>
        productApi
          .get(slug)
          .then((p) => [slug, p] as const)
          .catch(() => [slug, null] as const),
      ),
    ).then((entries) => {
      if (!active) return;
      setProducts(Object.fromEntries(entries));
      setLoading(false);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugsKey]);

  return (
    <div className="min-h-screen bg-bg text-text">
      <Nav />
      <main id="main-content" tabIndex={-1} className="page-width pb-16 pt-8">
        <h1 className="text-3xl font-semibold tracking-tight">Favorites</h1>
        <p className="mt-2 text-sm text-text-muted">Things you want to come back to.</p>

        {wishlist.slugs.length === 0 ? (
          <div className="mt-10 rounded-xl border border-border bg-surface px-6 py-16 text-center">
            <h2 className="text-xl font-semibold">No favorites yet.</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm text-text-muted">
              Tap the heart on any find to save it here.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-accent px-5 font-medium text-accent-text"
            >
              Explore finds
            </Link>
          </div>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading && (
              <li role="status" className="text-sm text-text-muted">
                Loading your favorites…
              </li>
            )}
            {wishlist.slugs.map((slug) => {
              const product = products[slug];
              if (product === undefined) return null;
              if (product === null) {
                return (
                  <li key={slug} className="flex flex-col gap-3 rounded-xl border border-border p-4">
                    <p className="text-sm">This product is no longer available.</p>
                    <button
                      className="min-h-11 rounded-xl border border-border px-4 text-sm"
                      onClick={() => wishlist.remove(slug)}
                    >
                      Remove
                    </button>
                  </li>
                );
              }
              return (
                <li key={slug} className="flex flex-col gap-3 rounded-xl border border-border p-4">
                  <Link href={`/products/${product.slug}`} className="block">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-surface">
                      {product.imageUrls[0] && (
                        <Image
                          src={product.imageUrls[0]}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 30vw, 50vw"
                          unoptimized={!product.imageUrls[0].startsWith("/")}
                          className="object-cover"
                        />
                      )}
                    </div>
                    <p className="mt-3 font-medium">{product.name}</p>
                    <p className="text-sm text-text-muted">{product.store.storeName}</p>
                    <p className="mt-1 font-semibold">
                      {formatMoney(product.effectivePriceCents, product.currency)}
                    </p>
                  </Link>
                  <div className="mt-auto flex flex-wrap gap-2">
                    <button
                      disabled={!product.inStock}
                      className="min-h-11 flex-1 rounded-xl bg-accent px-4 text-sm font-medium text-accent-text disabled:opacity-40"
                      onClick={() => cart.add(slug, 1)}
                    >
                      {product.inStock ? "Add to bag" : "Out of stock"}
                    </button>
                    <button
                      className="min-h-11 rounded-xl border border-border px-4 text-sm"
                      onClick={() => wishlist.remove(slug)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}