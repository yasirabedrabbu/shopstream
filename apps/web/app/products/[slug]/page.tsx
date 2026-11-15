"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { ProductReviews } from "@/components/ProductReviews";
import { Icon } from "@/components/ui/Icon";
import { buttonClasses } from "@/components/ui/Button";
import { productApi } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { useCart, MAX_QUANTITY } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import type { PublicProductResponse } from "@/lib/types";

function ProductDetailContent() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const cart = useCart();
  const wishlist = useWishlist();

  const [product, setProduct] = useState<PublicProductResponse | null>(null);
  const [related, setRelated] = useState<PublicProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [qty, setQty] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    productApi
      .get(slug)
      .then((data) => {
        if (active) setProduct(data);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    productApi
      .list({ size: 4 })
      .then((data) => {
        if (active) setRelated(data.content.filter((p) => p.slug !== slug).slice(0, 3));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [slug, attempt]);

  function buyNow() {
    if (!product) return;
    const destination = `/checkout?product=${encodeURIComponent(product.slug)}&qty=${qty}`;
    router.push(isLoggedIn() ? destination : `/auth/login?next=${encodeURIComponent(destination)}`);
  }

  function addToBag() {
    if (!product) return;
    cart.add(product.slug, qty);
    setNotice(`${qty} × ${product.name} added to your bag.`);
  }

  const saved = product ? wishlist.has(product.slug) : false;

  return (
    <div className="min-h-screen bg-bg text-text">
      <Nav />
      <main id="main-content" tabIndex={-1} className="page-width py-8 md:py-12">
        <nav aria-label="Breadcrumb" className="mb-7 flex flex-wrap items-center gap-2 text-xs text-text-muted">
          <Link href="/" className="inline-flex min-h-9 items-center">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/products" className="inline-flex min-h-9 items-center">
            Shop
          </Link>
          {product && (
            <>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{product.name}</span>
            </>
          )}
        </nav>

        {loading ? (
          <div role="status" className="grid gap-10 md:grid-cols-2">
            <span className="sr-only">Loading product</span>
            <div className="aspect-square animate-pulse rounded-2xl bg-surface" />
            <div className="h-72 animate-pulse rounded-2xl bg-surface" />
          </div>
        ) : error || !product ? (
          <div role="alert" className="rounded-2xl bg-surface p-10 text-center">
            <h1 className="text-2xl font-semibold">We couldn’t find that product.</h1>
            <p className="mt-3 text-text-muted">It may have moved, or the collection may be unavailable.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => {
                  setLoading(true);
                  setError(false);
                  setAttempt((a) => a + 1);
                }}
                className={buttonClasses({ variant: "secondary" })}
              >
                Try again
              </button>
              <Link href="/products" className={buttonClasses()}>
                Explore all finds
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid items-start gap-8 md:grid-cols-2 lg:gap-16">
              <div>
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface">
                  {product.imageUrls[imageIndex] ? (
                    <Image
                      src={product.imageUrls[imageIndex]}
                      unoptimized={!product.imageUrls[imageIndex].startsWith("/")}
                      alt={product.name}
                      fill
                      priority
                      sizes="(min-width: 768px) 48vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-text-muted">
                      <Icon name="box" size={48} />
                    </div>
                  )}
                </div>
                {product.imageUrls.length > 1 && (
                  <div aria-label="Product images" className="mt-3 flex gap-2">
                    {product.imageUrls.map((url, i) => (
                      <button
                        key={url}
                        onClick={() => setImageIndex(i)}
                        aria-label={`View image ${i + 1} of ${product.name}`}
                        aria-pressed={imageIndex === i}
                        className={`relative h-20 w-20 overflow-hidden rounded-lg border-2 ${imageIndex === i ? "border-text" : "border-transparent"}`}
                      >
                        <Image
                          src={url}
                          alt=""
                          fill
                          sizes="80px"
                          unoptimized={!url.startsWith("/")}
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-5 py-1">
                <Link
                  href={`/stores/${product.store.slug}`}
                  className="flex min-h-9 w-fit items-center gap-2 text-sm text-text-muted hover:text-text"
                >
                  <Icon name="store" size={16} />
                  {product.store.storeName}
                  <Icon name="arrowRight" size={14} />
                </Link>

                <div>
                  <p className="eyebrow mb-3 text-text-muted">{product.category.name}</p>
                  <h1 className="text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">
                    {product.name}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-2xl font-semibold">
                    {formatMoney(product.effectivePriceCents, product.currency)}
                  </span>
                  {product.flashSaleActive && (
                    <span className="text-sm text-text-muted line-through">
                      <span className="sr-only">Was </span>
                      {formatMoney(product.priceCents, product.currency)}
                    </span>
                  )}
                </div>

                <p className="text-sm leading-relaxed text-text-muted">{product.description}</p>

                <p className={`flex items-center gap-2 text-sm font-medium ${product.inStock ? "text-success" : "text-danger"}`}>
                  <Icon name={product.inStock ? "checkCircle" : "info"} size={17} />
                  {product.inStock ? "In stock" : "Currently unavailable"}
                </p>

                {product.inStock ? (
                  <div className="border-y border-border py-6">
                    <label className="mb-3 block text-xs font-semibold" htmlFor="quantity">
                      Quantity
                    </label>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex h-12 items-center rounded-xl border border-border">
                        <button
                          onClick={() => setQty((q) => Math.max(1, q - 1))}
                          disabled={qty === 1}
                          aria-label="Decrease quantity"
                          className="h-11 w-11 rounded-l-xl text-lg disabled:opacity-30"
                        >
                          −
                        </button>
                        <input
                          id="quantity"
                          type="number"
                          min="1"
                          max={MAX_QUANTITY}
                          value={qty}
                          onChange={(e) =>
                            setQty(
                              Math.min(MAX_QUANTITY, Math.max(1, Number.parseInt(e.target.value, 10) || 1)),
                            )
                          }
                          className="h-11 w-12 bg-transparent text-center text-base"
                        />
                        <button
                          onClick={() => setQty((q) => Math.min(MAX_QUANTITY, q + 1))}
                          disabled={qty >= MAX_QUANTITY}
                          aria-label="Increase quantity"
                          className="h-11 w-11 rounded-r-xl text-lg disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={addToBag}
                        className="min-h-12 flex-1 rounded-xl border border-border px-5 font-medium text-text"
                      >
                        Add to bag
                      </button>
                      <button
                        onClick={buyNow}
                        className={buttonClasses({ size: "lg", className: "min-w-36 flex-1" })}
                      >
                        Buy now
                        <Icon name="arrowRight" size={17} />
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-4">
                      <button
                        type="button"
                        aria-pressed={saved}
                        onClick={() => wishlist.toggle(product.slug)}
                        className="inline-flex min-h-11 items-center gap-2 text-sm underline underline-offset-4"
                      >
                        <Icon name="heart" size={16} />
                        {saved ? "Saved to favorites" : "Save to favorites"}
                      </button>
                      <Link
                        href="/account/cart"
                        className="inline-flex min-h-11 items-center text-sm underline underline-offset-4"
                      >
                        View bag
                      </Link>
                    </div>

                    {notice && (
                      <p role="status" className="mt-4 text-sm text-success">
                        {notice}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      aria-pressed={saved}
                      onClick={() => wishlist.toggle(product.slug)}
                      className="min-h-11 rounded-xl border border-border px-5 text-sm"
                    >
                      {saved ? "Saved to favorites" : "Save to favorites"}
                    </button>
                    <Link
                      href={`/products?category=${product.category.slug}`}
                      className={buttonClasses({ variant: "secondary" })}
                    >
                      Explore similar finds
                    </Link>
                  </div>
                )}

                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <Icon name="truck" className="mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold">Delivery, without the guesswork</p>
                      <p className="mt-1 text-xs leading-relaxed text-text-muted">
                        Final delivery costs and timing are confirmed at checkout.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="shield" className="mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold">Know before you buy</p>
                      <p className="mt-1 text-xs leading-relaxed text-text-muted">
                        Review the seller’s return conditions before placing an order.
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="inline-flex min-h-11 w-fit items-center gap-2 text-sm underline underline-offset-4"
                >
                  More in {product.category.name}
                  <Icon name="arrowRight" size={14} />
                </Link>
              </div>
            </div>

            <ProductReviews slug={product.slug} />

            {related.length > 0 && (
              <section className="mt-16 border-t border-border pt-10">
                <div className="mb-6 flex items-end justify-between gap-4">
                  <h2 className="text-2xl font-semibold tracking-tight">A few more good finds</h2>
                  <Link href="/products" className="inline-flex min-h-11 items-center text-sm">
                    View all
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {related.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  return <ProductDetailContent key={slug} />;
}