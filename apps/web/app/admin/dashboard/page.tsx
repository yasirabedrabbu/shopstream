// apps/web/src/app/admin/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { useToast } from "@/components/Toast";
import type { PlatformStatsResponse } from "@/lib/types";

type Period = "7d" | "30d" | "all";

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<PlatformStatsResponse | null>(null);
  const [period, setPeriod] = useState<Period>("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminApi
      .stats(period)
      .then((s) => {
        if (!cancelled) setStats(s);
      })
      .catch((err) => toast(err instanceof Error ? err.message : "Could not load stats.", "error"))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [period, toast]);

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
          Platform overview
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

      {loading || !stats ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Tile label="GMV" value={formatMoney(stats.sales.gmvCents, stats.currency)} wide />
            <Tile label="Commission" value={formatMoney(stats.sales.commissionCents, stats.currency)} />
            <Tile label="Paid orders" value={stats.sales.paidOrders} />
            <Tile label="Units sold" value={stats.sales.unitsSold} />
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <Panel title="Users by role">
              <CountList data={stats.usersByRole} />
            </Panel>
            <Panel title="Vendors by status">
              <CountList data={stats.vendorsByStatus} highlightKey="PENDING" />
            </Panel>
            <Panel title="Products by status">
              <CountList data={stats.productsByStatus} />
            </Panel>
            <Panel title="Orders by status">
              <CountList data={stats.ordersByStatus} />
            </Panel>
          </div>

          <div className="mt-6 rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold mb-3" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
              Top vendors
            </p>
            {stats.topVendors.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No sales in this period.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {stats.topVendors.map((v) => (
                  <div key={v.vendorId} className="flex items-center justify-between text-sm gap-4">
                    <span className="truncate" style={{ color: "var(--text)" }}>{v.storeName}</span>
                    <span className="shrink-0" style={{ color: "var(--text-muted)" }}>
                      {formatMoney(v.grossCents, stats.currency)} · {v.orders} orders
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Tile({ label, value, wide }: { label: string; value: string | number; wide?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col gap-2 ${wide ? "md:col-span-2" : ""}`}
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
        {value}
      </p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-5 flex flex-col gap-3" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function CountList({ data, highlightKey }: { data: Record<string, number>; highlightKey?: string }) {
  const entries = Object.entries(data);
  if (entries.length === 0) {
    return <p className="text-sm" style={{ color: "var(--text-muted)" }}>No data.</p>;
  }
  return (
    <>
      {entries.map(([key, count]) => (
        <div key={key} className="flex items-center justify-between text-sm">
          <span style={{ color: "var(--text)" }}>{key}</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              key === highlightKey && count > 0 ? "bg-[#E8F44A] text-zinc-900" : ""
            }`}
            style={key === highlightKey && count > 0 ? {} : { color: "var(--text-muted)" }}
          >
            {count}
          </span>
        </div>
      ))}
    </>
  );
}