"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Pager } from "@/components/Pager";
import { Icon } from "@/components/ui/Icon";
import { buttonClasses } from "@/components/ui/Button";
import { storeApi } from "@/lib/api";
import { DEMO_MODE } from "@/lib/demo";
import type { PublicProductResponse, PublicStoreResponse } from "@/lib/types";

function StoreDetailContent() {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<PublicStoreResponse | null>(null);
  const [products, setProducts] = useState<PublicProductResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    Promise.all([storeApi.get(slug), storeApi.products(slug, page)])
      .then(([s, p]) => {
        if (active) {
          setStore(s);
          setProducts(p.content);
          setTotalPages(p.totalPages);
          setTotal(p.totalElements);
        }
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
  }, [slug, page, attempt]);
  return (
    <div className="min-h-screen bg-bg text-text">
      <Nav />
      <main id="main-content" tabIndex={-1} className="page-width py-10">
        <Link
          href="/products"
          className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-text-muted"
        >
          <Icon name="arrowLeft" size={16} />
          Back to all finds
        </Link>
        {loading ? (
          <div
            role="status"
            className="h-80 animate-pulse rounded-xl bg-surface"
          >
            <span className="sr-only">Loading store</span>
          </div>
        ) : error || !store ? (
          <section
            role="alert"
            className="rounded-xl bg-surface p-10 text-center"
          >
            <h1 className="text-2xl font-semibold">
              This store couldn’t be loaded.
            </h1>
            <p className="mt-3 text-sm text-text-muted">
              The link may have changed, or the store may be unavailable.
            </p>
            <button
              className={buttonClasses({
                variant: "secondary",
                className: "mt-5",
              })}
              onClick={() => {
                setLoading(true);
                setError(false);
                setAttempt((a) => a + 1);
              }}
            >
              Try again
            </button>
          </section>
        ) : (
          <>
            <section className="mb-10 flex flex-col items-start gap-5 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:p-8">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-accent text-2xl font-semibold text-accent-text">
                {store.storeName[0]}
              </span>
              <div>
                {DEMO_MODE && (
                  <p className="eyebrow mb-2 text-text-muted">
                    Sample independent store
                  </p>
                )}
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {store.storeName}
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-muted">
                  {store.description}
                </p>
              </div>
            </section>
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">The collection</h2>
              <p className="text-sm text-text-muted">
                {total} {total === 1 ? "find" : "finds"}
              </p>
            </div>
            {products.length ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <p className="rounded-xl bg-surface p-10 text-center text-text-muted">
                This store hasn’t listed any products yet.
              </p>
            )}
            <Pager
              page={page}
              totalPages={totalPages}
              onChange={(value) => {
                setLoading(true);
                setPage(value);
              }}
            />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function StoreDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  return <StoreDetailContent key={slug} />;
}
