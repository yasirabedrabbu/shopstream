"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { productApi } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { MAX_QUANTITY, useCart } from "@/lib/cart";
import type { PublicProductResponse } from "@/lib/types";

const btn =
  "grid h-11 w-11 place-items-center rounded-xl border border-border text-lg disabled:opacity-40";

export default function CartPage() {
  const cart = useCart();
  const [products, setProducts] = useState<Record<string, PublicProductResponse | null>>({});
  const [loading, setLoading] = useState(true);

  const slugsKey = cart.lines.map((l) => l.slug).join(",");

  useEffect(() => {
    let active = true;
    if (!cart.lines.length) {
      setProducts({});
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(
      cart.lines.map((l) =>
        productApi
          .get(l.slug)
          .then((p) => [l.slug, p] as const)
          .catch(() => [l.slug, null] as const),
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

  const rows = cart.lines.map((line) => ({ line, product: products[line.slug] }));

  const subtotal = rows.reduce((sum, { line, product }) => {
    if (!product || !product.inStock) return sum;
    return sum + product.effectivePriceCents * line.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-bg text-text">
      <Nav />
      <main id="main-content" tabIndex={-1} className="page-width pb-16 pt-8">
        <h1 className="text-3xl font-semibold tracking-tight">Shopping bag</h1>
        <p className="mt-2 text-sm text-text-muted">Good choices, all together.</p>

        {cart.lines.length === 0 ? (
          <div className="mt-10 rounded-xl border border-border bg-surface px-6 py-16 text-center">
            <h2 className="text-xl font-semibold">Your bag is empty.</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm text-text-muted">
              Find something you love and add it here.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-accent px-5 font-medium text-accent-text"
            >
              Shop all finds
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
            <ul className="flex flex-col gap-4">
              {loading && (
                <li role="status" className="text-sm text-text-muted">
                  Loading your bag…
                </li>
              )}
              {rows.map(({ line, product }) => {
                if (product === undefined) return null;
                if (product === null) {
                  return (
                    <li
                      key={line.slug}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4"
                    >
                      <p className="text-sm">This product is no longer available.</p>
                      <button
                        className="min-h-11 rounded-xl border border-border px-4 text-sm"
                        onClick={() => cart.remove(line.slug)}
                      >
                        Remove
                      </button>
                    </li>
                  );
                }
                return (
                  <li key={line.slug} className="flex gap-4 rounded-xl border border-border p-4">
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-surface">
                      {product.imageUrls[0] && (
                        <Image
                          src={product.imageUrls[0]}
                          alt=""
                          fill
                          sizes="80px"
                          unoptimized={!product.imageUrls[0].startsWith("/")}
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                      <div>
                        <Link href={`/products/${product.slug}`} className="font-medium hover:underline">
                          {product.name}
                        </Link>
                        <p className="text-sm text-text-muted">{product.store.storeName}</p>
                        {!product.inStock && (
                          <p role="alert" className="text-sm text-red-600">
                            Out of stock. Remove it or check back later.
                          </p>
                        )}
                      </div>
                      <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2" role="group" aria-label={`Quantity for ${product.name}`}>
                          <button
                            className={btn}
                            aria-label="Decrease quantity"
                            onClick={() => cart.setQuantity(line.slug, line.quantity - 1)}
                          >
                            −
                          </button>
                          <span className="w-8 text-center" aria-live="polite">
                            {line.quantity}
                          </span>
                          <button
                            className={btn}
                            aria-label="Increase quantity"
                            disabled={line.quantity >= MAX_QUANTITY}
                            onClick={() => cart.setQuantity(line.slug, line.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold">
                            {formatMoney(product.effectivePriceCents * line.quantity, product.currency)}
                          </span>
                          <button
                            className="min-h-11 text-sm text-text-muted underline underline-offset-4"
                            onClick={() => cart.remove(line.slug)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <aside className="h-fit rounded-xl border border-border p-5">
              <h2 className="text-lg font-semibold">Summary</h2>
              <div className="mt-4 flex justify-between text-sm">
                <span className="text-text-muted">Items subtotal</span>
                <span>{formatMoney(subtotal, "BDT")}</span>
              </div>
              <p className="mt-3 text-xs text-text-muted">Delivery is calculated at checkout.</p>
              <Link
                href="/checkout"
                className="mt-6 flex min-h-12 items-center justify-center rounded-xl bg-accent font-medium text-accent-text"
              >
                Continue to checkout
              </Link>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}