// apps/web/src/app/vendor/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { vendorApi } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import type { VendorDashboardResponse } from "@/lib/types";

type Period = "7d" | "30d" | "all";

export default function VendorDashboardPage() {
  const [data, setData] = useState<VendorDashboardResponse | null>(null);
  const [period, setPeriod] = useState<Period>("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    vendorApi
      .dashboard(period)
      .then(setData)
      .finally(() => setLoading(false));
  }, [period]);

  const tiles = data
    ? [
        { label: "Revenue", value: formatMoney(data.totalRevenueCents, "BDT"), big: true },
        { label: "Orders", value: data.totalOrders },
        { label: "Products", value: data.totalProducts },
        { label: "Pending", value: data.pendingOrders },
      ]
    : [];

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}
        >
          Dashboard
        </h1>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--surface)" }}>
          {(["7d", "30d", "all"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                period === p ? "bg-[#E8F44A] text-zinc-900" : ""
              }`}
              style={period !== p ? { color: "var(--text-muted)" } : {}}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Bento grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl animate-pulse"
              style={{ background: "var(--surface)" }}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tiles.map((t) => (
            <div
              key={t.label}
              className={`rounded-2xl border p-5 flex flex-col gap-2 ${t.big ? "md:col-span-2" : ""}`}
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                {t.label}
              </p>
              <p
                className="text-2xl font-bold"
                style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}
              >
                {t.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Revenue chart — simple bar */}
      {data && data.revenueByDay.length > 0 && (
        <div
          className="mt-6 rounded-2xl border p-5"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <p
            className="text-sm font-semibold mb-4"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}
          >
            Revenue by Day
          </p>
          <div className="flex items-end gap-1 h-32">
            {data.revenueByDay.map((d) => {
              const max = Math.max(...data.revenueByDay.map((x) => x.revenueCents), 1);
              const pct = (d.revenueCents / max) * 100;
              return (
                <div
                  key={d.date}
                  className="flex-1 rounded-t-md relative group"
                  style={{ height: `${Math.max(pct, 2)}%`, background: "#E8F44A", opacity: 0.85 }}
                  title={`${d.date}: ${formatMoney(d.revenueCents, "BDT")}`}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}