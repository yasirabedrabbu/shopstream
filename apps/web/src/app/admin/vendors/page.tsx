// apps/web/src/app/admin/vendors/page.tsx
"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { vendorStatusBadge } from "@/components/Badge";
import { useToast } from "@/components/Toast";
import { formatDate } from "@/lib/money";
import type { StoreResponse } from "@/lib/types";

export default function AdminVendorsPage() {
  const { toast } = useToast();
  const [vendors, setVendors] = useState<StoreResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    adminApi.vendors().then((data) => setVendors(data.content)).finally(() => setLoading(false));
  }, []);

  async function setStatus(id: number, status: string) {
    setUpdating(id);
    try {
      const updated = await adminApi.updateVendorStatus(id, status);
      setVendors((prev) => prev.map((v) => (v.id === id ? updated : v)));
      toast(`Vendor ${status.toLowerCase()}.`, "success");
    } catch {
      toast("Update failed.", "error");
    } finally {
      setUpdating(null);
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
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--surface)", borderBottom: `1px solid var(--border)` }}>
                {["Store", "Owner", "Joined", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id} style={{ borderBottom: `1px solid var(--border)`, background: "var(--bg)" }}>
                  <td className="px-4 py-3">
                    <p className="font-medium" style={{ color: "var(--text)" }}>{v.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>/{v.slug}</p>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--text)" }}>{v.ownerName}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{formatDate(v.createdAt)}</td>
                  <td className="px-4 py-3">{vendorStatusBadge(v.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {v.status !== "APPROVED" && (
                        <button
                          onClick={() => setStatus(v.id, "APPROVED")}
                          disabled={updating === v.id}
                          className="px-3 py-1 rounded-lg bg-[#E8F44A] text-zinc-900 text-xs font-semibold disabled:opacity-60"
                        >
                          Approve
                        </button>
                      )}
                      {v.status !== "SUSPENDED" && (
                        <button
                          onClick={() => setStatus(v.id, "SUSPENDED")}
                          disabled={updating === v.id}
                          className="px-3 py-1 rounded-lg border text-xs font-medium disabled:opacity-60"
                          style={{ borderColor: "var(--border)", color: "var(--text)" }}
                        >
                          Suspend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}