// apps/web/src/app/admin/products/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { productStatusBadge } from "@/components/Badge";
import { Pager } from "@/components/Pager";
import { useToast } from "@/components/Toast";
import { formatMoney } from "@/lib/money";
import type { AdminProductResponse } from "@/lib/types";

export default function AdminProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<AdminProductResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(
    (p: number) => {
      setLoading(true);
      adminApi
        .products(p)
        .then((data) => {
          setProducts(data.content);
          setTotalPages(data.totalPages);
          setPage(p);
        })
        .catch((err) => toast(err instanceof Error ? err.message : "Could not load products.", "error"))
        .finally(() => setLoading(false));
    },
    [toast],
  );

  useEffect(() => {
    load(0);
  }, [load]);

  async function toggle(p: AdminProductResponse) {
    const blocking = p.status !== "BLOCKED";
    setBusy(p.id);
    try {
      if (blocking) {
        await adminApi.blockProduct(p.id);
      } else {
        await adminApi.unblockProduct(p.id);
      }
      toast(blocking ? "Product blocked." : "Product unblocked.", "success");
      load(page);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Update failed.", "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
        Products
      </h1>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24" style={{ color: "var(--text-muted)" }}>No products.</div>
      ) : (
        <div className="rounded-2xl border overflow-x-auto" style={{ borderColor: "var(--border)" }}>
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
                {["Product", "Store", "Price", "Stock", "Status", "Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
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
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{p.storeName}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--text)" }}>
                    {formatMoney(p.priceCents, p.currency)}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--text)" }}>{p.stockQuantity}</td>
                  <td className="px-4 py-3">{productStatusBadge(p.status)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggle(p)}
                      disabled={busy === p.id}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60 min-h-[36px] ${
                        p.status === "BLOCKED" ? "bg-[#E8F44A] text-zinc-900" : "border text-red-500 border-red-200 dark:border-red-900"
                      }`}
                    >
                      {p.status === "BLOCKED" ? "Unblock" : "Block"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pager page={page} totalPages={totalPages} onChange={load} />
    </div>
  );
}