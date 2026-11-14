// apps/web/src/app/vendor/products/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { vendorApi } from "@/lib/api";
import { productStatusBadge } from "@/components/Badge";
import { useToast } from "@/components/Toast";
import { formatMoney } from "@/lib/money";
import type { ProductResponse } from "@/lib/types";

export default function VendorProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  function load(p: number) {
    setLoading(true);
    vendorApi
      .products(p)
      .then((data) => {
        setProducts(data.content);
        setTotalPages(data.totalPages);
        setPage(p);
      })
      .catch((err) => toast(err instanceof Error ? err.message : "Could not load products.", "error"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
          Products
        </h1>
        <Link
          href="/vendor/products/new"
          className="px-4 py-2 rounded-xl bg-[#E8F44A] text-zinc-900 text-sm font-semibold min-h-[44px] flex items-center"
        >
          + Add product
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24" style={{ color: "var(--text-muted)" }}>
          No products yet.{" "}
          <Link href="/vendor/products/new" className="underline" style={{ color: "var(--text)" }}>
            Add one
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-x-auto" style={{ borderColor: "var(--border)" }}>
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
                {["Product", "Price", "Stock", "Status", ""].map((h, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
                  <td className="px-4 py-3">
                    <p className="font-medium line-clamp-1" style={{ color: "var(--text)" }}>{p.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.categoryName}</p>
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--text)" }}>
                    {formatMoney(p.effectivePriceCents, p.currency)}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--text)" }}>{p.stockQuantity}</td>
                  <td className="px-4 py-3">{productStatusBadge(p.status)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/vendor/products/${p.id}/edit`}
                      className="text-xs font-medium hover:underline"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex gap-2 mt-6 justify-center">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => load(i)}
              className={`w-9 h-9 rounded-full text-sm font-medium border ${
                i === page ? "bg-[#E8F44A] text-zinc-900 border-[#E8F44A]" : ""
              }`}
              style={i !== page ? { borderColor: "var(--border)", color: "var(--text)" } : {}}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}