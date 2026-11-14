// apps/web/src/app/vendor/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { vendorApi } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import type { VendorDashboardResponse } from "@/lib/types";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Button, ButtonLink } from "@/components/ui/Button";

type Period = "7d" | "30d" | "all";

const PERIODS: { value: Period; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "all", label: "All time" },
];

function humanize(value: string): string {
  const text = value.replace(/_/g, " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function shortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function VendorDashboardPage() {
  const [data, setData] = useState<VendorDashboardResponse | null>(null);
  const [period, setPeriod] = useState<Period>("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

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
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load the dashboard.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [period, reloadKey]);

  const daily = data?.daily ?? [];
  const maxDaily = Math.max(...daily.map((d) => d.grossCents), 1);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 md:p-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text" style={{ fontFamily: "var(--font-heading)" }}>
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-text-muted">Sales, fulfilment and stock at a glance.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ButtonLink href="/vendor/orders" variant="secondary" size="sm">
            <Icon name="receipt" size={16} />
            View orders
          </ButtonLink>
          <ButtonLink href="/vendor/products/new" size="sm">
            <Icon name="box" size={16} />
            New product
          </ButtonLink>
        </div>
      </header>

      <div className="flex items-center justify-between gap-3">
        <div role="group" aria-label="Period" className="flex gap-1 rounded-xl bg-surface p-1">
          {PERIODS.map((p) => {
            const active = period === p.value;
            return (
              <button
                key={p.value}
                type="button"
                aria-pressed={active}
                onClick={() => setPeriod(p.value)}
                className={`min-h-9 rounded-lg px-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus)] ${
                  active ? "bg-accent text-accent-text shadow-sm" : "text-text-muted hover:text-text"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm text-text">{error}</p>
          <Button variant="secondary" size="sm" onClick={() => setReloadKey((k) => k + 1)}>
            Try again
          </Button>
        </div>
      )}

      {loading && !data && !error && (
        <div aria-busy="true" aria-label="Loading dashboard" className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-surface" />
          ))}
        </div>
      )}

      {data && (
        <div
          aria-busy={loading || undefined}
          className={`flex flex-col gap-6 transition-opacity duration-200 ${loading ? "opacity-60" : ""}`}
        >
          <section aria-label="Key figures" className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat
              icon="wallet"
              label="Gross revenue"
              value={formatMoney(data.revenue.grossCents, data.currency)}
            />
            <Stat
              icon="wallet"
              label="Net after commission"
              value={formatMoney(data.revenue.netCents, data.currency)}
              hint={`Commission ${formatMoney(data.revenue.commissionCents, data.currency)}`}
            />
            <Stat icon="receipt" label="Orders" value={data.revenue.orders.toLocaleString("en-US")} />
            <Stat icon="box" label="Units sold" value={data.revenue.units.toLocaleString("en-US")} />
          </section>

          <section
            aria-labelledby="daily-title"
            className="rounded-2xl border border-border bg-surface p-5 md:p-6"
          >
            <div className="mb-5 flex items-baseline justify-between gap-4">
              <h2 id="daily-title" className="text-sm font-semibold text-text" style={{ fontFamily: "var(--font-heading)" }}>
                Gross revenue by day
              </h2>
              {daily.length > 0 && (
                <p className="text-xs text-text-muted">
                  Peak {formatMoney(maxDaily, data.currency)}
                </p>
              )}
            </div>

            {daily.length === 0 ? (
              <p className="py-8 text-center text-sm text-text-muted">No sales in this period yet.</p>
            ) : (
              <>
                <div
                  role="img"
                  aria-label={`Daily gross revenue over ${daily.length} days. Peak ${formatMoney(maxDaily, data.currency)}.`}
                  className="flex h-40 items-end gap-1.5"
                >
                  {daily.map((d) => (
                    <div key={d.date} className="group relative flex h-full flex-1 items-end">
                      <div
                        className="w-full rounded-t-md bg-accent transition-opacity duration-200 group-hover:opacity-80"
                        style={{ height: `${Math.max((d.grossCents / maxDaily) * 100, 3)}%` }}
                      />
                      <div className="pointer-events-none absolute -top-12 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-text px-2.5 py-1.5 text-[11px] text-bg shadow-md group-hover:block">
                        <span className="block font-semibold">{shortDate(d.date)}</span>
                        {formatMoney(d.grossCents, data.currency)} · {d.orders} order{d.orders === 1 ? "" : "s"}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-text-muted">
                  <span>{shortDate(daily[0].date)}</span>
                  <span>{shortDate(daily[daily.length - 1].date)}</span>
                </div>
              </>
            )}
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <Panel title="Fulfilment pipeline">
              {Object.keys(data.pipeline).length === 0 ? (
                <p className="text-sm text-text-muted">No orders to fulfil yet.</p>
              ) : (
                Object.entries(data.pipeline).map(([status, count]) => (
                  <Row key={status} left={humanize(status)} right={String(count ?? 0)} />
                ))
              )}
            </Panel>

            <Panel title="Low stock">
              {data.lowStock.length === 0 ? (
                <p className="text-sm text-text-muted">Every product is well stocked.</p>
              ) : (
                data.lowStock.map((p) => (
                  <Row
                    key={p.productId}
                    left={p.name}
                    right={`${p.stockQuantity} left`}
                    href={`/vendor/products/${p.productId}/edit`}
                  />
                ))
              )}
            </Panel>

            <Panel title="Top products">
              {data.topProducts.length === 0 ? (
                <p className="text-sm text-text-muted">No sales yet. Share your store to get your first order.</p>
              ) : (
                data.topProducts.map((p) => (
                  <Row
                    key={p.productId}
                    left={p.name}
                    right={`${p.unitsSold} sold · ${formatMoney(p.revenueCents, data.currency)}`}
                  />
                ))
              )}
            </Panel>

            <Panel title="Recent sales">
              {data.recent.length === 0 ? (
                <p className="text-sm text-text-muted">No recent sales in this period.</p>
              ) : (
                data.recent.map((item) => (
                  <Row
                    key={item.itemId}
                    left={`${item.productName} × ${item.quantity}`}
                    right={humanize(item.fulfillmentStatus)}
                    href={`/vendor/orders`}
                  />
                ))
              )}
            </Panel>
          </section>
        </div>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  hint,
}: {
  icon: IconName;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-text-muted">{label}</p>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-bg text-text-muted">
          <Icon name={icon} size={16} />
        </span>
      </div>
      <p className="break-words text-xl font-bold text-text md:text-2xl" style={{ fontFamily: "var(--font-heading)" }}>
        {value}
      </p>
      {hint && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-text" style={{ fontFamily: "var(--font-heading)" }}>
        {title}
      </h2>
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

function Row({ left, right, href }: { left: string; right: string; href?: string }) {
  const content = (
    <>
      <span className="truncate text-text">{left}</span>
      <span className="shrink-0 text-text-muted">{right}</span>
    </>
  );

  const base = "flex min-h-11 items-center justify-between gap-4 rounded-lg px-2 -mx-2 text-sm";

  if (href) {
    return (
      <Link
        href={href}
        className={`${base} transition-colors hover:bg-bg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus)]`}
      >
        {content}
      </Link>
    );
  }

  return <div className={base}>{content}</div>;
}