// apps/web/src/app/admin/vendors/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { vendorStatusBadge } from "@/components/Badge";
import { Pager } from "@/components/Pager";
import { useToast } from "@/components/Toast";
import { formatDate } from "@/lib/money";
import type { VendorResponse, VendorStatus } from "@/lib/types";

const ACTIONS: Record<VendorStatus, { to: VendorStatus; label: string; primary?: boolean }[]> = {
  PENDING: [
    { to: "APPROVED", label: "Approve", primary: true },
    { to: "REJECTED", label: "Reject" },
  ],
  APPROVED: [{ to: "SUSPENDED", label: "Suspend" }],
  SUSPENDED: [{ to: "APPROVED", label: "Reinstate", primary: true }],
  REJECTED: [{ to: "APPROVED", label: "Approve", primary: true }],
};

export default function AdminVendorsPage() {
  const { toast } = useToast();
  const [vendors, setVendors] = useState<VendorResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(
    (p: number) => {
      setLoading(true);
      adminApi
        .vendors(p)
        .then((data) => {
          setVendors(data.content);
          setTotalPages(data.totalPages);
          setPage(p);
        })
        .catch((err) => toast(err instanceof Error ? err.message : "Could not load vendors.", "error"))
        .finally(() => setLoading(false));
    },
    [toast],
  );

  useEffect(() => {
    load(0);
  }, [load]);

  async function setStatus(v: VendorResponse, to: VendorStatus) {
    setBusy(v.id);
    try {
      const updated = await adminApi.updateVendorStatus(v.id, to);
      setVendors((prev) => prev.map((x) => (x.id === v.id ? updated : x)));
      toast(`${updated.storeName} is now ${to.toLowerCase()}.`, "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Update failed.", "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
        Vendors
      </h1>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />
          ))}
        </div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-24" style={{ color: "var(--text-muted)" }}>No vendors.</div>
      ) : (
        <div className="rounded-2xl border overflow-x-auto" style={{ borderColor: "var(--border)" }}>
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
                {["Store", "Joined", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id} style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
                  <td className="px-4 py-3">
                    <p className="font-medium" style={{ color: "var(--text)" }}>{v.storeName}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>/{v.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                    {formatDate(v.createdAt)}
                  </td>
                  <td className="px-4 py-3">{vendorStatusBadge(v.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      {ACTIONS[v.status].map((a) => (
                        <button
                          key={a.to}
                          onClick={() => setStatus(v, a.to)}
                          disabled={busy === v.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60 min-h-[36px] ${
                            a.primary ? "bg-[#E8F44A] text-zinc-900" : "border"
                          }`}
                          style={a.primary ? {} : { borderColor: "var(--border)", color: "var(--text)" }}
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
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