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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    vendorApi
      .dashboard(period)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load dashboard.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [period]);

  const maxDaily = Math.max(...(data?.daily.map((d) => d.grossCents) ?? [0]), 1);

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
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

      {error && (
        <div className="rounded-2xl border p-5 text-sm mb-6" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}>
          {error}
        </div>
      )}

      {loading || !data ? (
        !error && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />
            ))}
          </div>
        )
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Tile label="Gross revenue" value={formatMoney(data.revenue.grossCents, data.currency)} wide />
            <Tile label="Net after commission" value={formatMoney(data.revenue.netCents, data.currency)} />
            <Tile label="Orders" value={data.revenue.orders} />
            <Tile label="Units sold" value={data.revenue.units} />
          </div>

          <div className="mt-6 rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold mb-4" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
              Gross revenue by day
            </p>
            {data.daily.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No sales in this period.</p>
            ) : (
              <div className="flex items-end gap-1 h-32">
                {data.daily.map((d) => (
                  <div
                    key={d.date}
                    className="flex-1 rounded-t-md"
                    style={{ height: `${Math.max((d.grossCents / maxDaily) * 100, 2)}%`, background: "#E8F44A" }}
                    title={`${d.date}: ${formatMoney(d.grossCents, data.currency)} (${d.orders} orders)`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <Panel title="Fulfilment pipeline">
              {Object.keys(data.pipeline).length === 0 ? (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No items yet.</p>
              ) : (
                Object.entries(data.pipeline).map(([status, count]) => (
                  <Row key={status} left={status} right={String(count)} />
                ))
              )}
            </Panel>

            <Panel title="Low stock">
              {data.lowStock.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>All products are well stocked.</p>
              ) : (
                data.lowStock.map((p) => <Row key={p.productId} left={p.name} right={`${p.stockQuantity} left`} />)
              )}
            </Panel>

            <Panel title="Top products">
              {data.topProducts.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No sales yet.</p>
              ) : (
                data.topProducts.map((p) => (
                  <Row key={p.productId} left={p.name} right={`${p.unitsSold} sold`} />
                ))
              )}
            </Panel>
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

function Row({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex items-center justify-between text-sm gap-4">
      <span className="truncate" style={{ color: "var(--text)" }}>{left}</span>
      <span className="shrink-0" style={{ color: "var(--text-muted)" }}>{right}</span>
    </div>
  );
}