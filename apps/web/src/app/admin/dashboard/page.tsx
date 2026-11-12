// apps/web/src/app/admin/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import type { PlatformStatsResponse } from "@/lib/types";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<PlatformStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.stats().then(setStats).finally(() => setLoading(false));
  }, []);

  const tiles = stats
    ? [
        { label: "Total Revenue", value: formatMoney(stats.totalRevenueCents, "BDT"), span: 2 },
        { label: "Total Orders", value: stats.totalOrders },
        { label: "Total Products", value: stats.totalProducts },
        { label: "Total Users", value: stats.totalUsers },
        { label: "Active Vendors", value: stats.totalVendors },
        { label: "Pending Vendors", value: stats.pendingVendors, highlight: stats.pendingVendors > 0 },
      ]
    : [];

  return (
    <div className="p-6 max-w-5xl">
      <h1
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}
      >
        Platform Overview
      </h1>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {tiles.map((t) => (
            <div
              key={t.label}
              className={`rounded-2xl border p-5 flex flex-col gap-2 ${(t as { span?: number }).span === 2 ? "md:col-span-2" : ""}`}
              style={{
                background: (t as { highlight?: boolean }).highlight ? "#E8F44A" : "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <p
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: (t as { highlight?: boolean }).highlight ? "#18181b" : "var(--text-muted)" }}
              >
                {t.label}
              </p>
              <p
                className="text-2xl font-bold"
                style={{ fontFamily: "var(--font-heading)", color: (t as { highlight?: boolean }).highlight ? "#18181b" : "var(--text)" }}
              >
                {t.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}