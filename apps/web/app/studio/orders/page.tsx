"use client";

import { useEffect, useState } from "react";
import { vendorApi } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import type { FulfillmentStatus, Page, VendorOrderItemResponse } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";
import { Avatar, Button, Card, FULFILL, NEXT_STEP, PageHeader, Pill, SearchBox, Segmented, shortId, timeAgo } from "@/components/studio/ui";

type Tab = "ALL" | FulfillmentStatus;
const ORDER_STATES: FulfillmentStatus[] = ["NEW", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function StudioOrdersPage() {
  const [tab, setTab] = useState<Tab>("ALL");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Page<VendorOrderItemResponse> | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selected, setSelected] = useState<VendorOrderItemResponse | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [counts, setCounts] = useState<Partial<Record<FulfillmentStatus, number>>>({});

  useEffect(() => {
    let active = true;
    setError("");
    vendorApi
      .orderItems(page)
      .then((res) => {
        if (active) setData(res);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Orders could not be loaded.");
      });
    return () => {
      active = false;
    };
  }, [page, reloadKey]);

  useEffect(() => {
    let active = true;
    vendorApi
      .dashboard("all")
      .then((d) => {
        if (active) setCounts(d.pipeline);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const rows = (data?.content ?? []).filter((i) => {
    if (tab !== "ALL" && i.fulfillmentStatus !== tab) return false;
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return `${i.orderId} ${i.productName} ${i.shippingAddress.fullName}`.toLowerCase().includes(needle);
  });

  async function advance(item: VendorOrderItemResponse) {
    const next = NEXT_STEP[item.fulfillmentStatus];
    if (!next) return;
    setBusyId(item.itemId);
    setError("");
    setNotice("");
    try {
      await vendorApi.advanceItem(item.itemId, next.to);
      setNotice(`Order #${shortId(item.orderId)} is now ${FULFILL[next.to].label.toLowerCase()}.`);
      setSelected(null);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The status could not be updated.");
    } finally {
      setBusyId(null);
    }
  }

  const totalCount = ORDER_STATES.reduce((sum, s) => sum + (counts[s] ?? 0), 0);

  return (
    <>
      <PageHeader
        title="Order management"
        subtitle="Monitor orders, payments and fulfilment in one place."
        actions={<Button variant="light" onClick={() => exportCsv(rows)} disabled={!rows.length}>Export CSV</Button>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="All items" value={totalCount} onClick={() => setTab("ALL")} active={tab === "ALL"} />
        {ORDER_STATES.map((s) => (
          <StatCard key={s} label={FULFILL[s].label} value={counts[s] ?? 0} onClick={() => setTab(s)} active={tab === s} tone={FULFILL[s].tone} />
        ))}
      </div>

      {notice && <p role="status" className="rounded-xl border border-tone-green/30 bg-tone-green-soft p-3 text-sm text-tone-green">{notice}</p>}
      {error && <p role="alert" className="rounded-xl border border-tone-red/30 bg-tone-red-soft p-3 text-sm text-tone-red">{error}</p>}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4">
          <div>
            <h2 className="text-base font-semibold">All orders</h2>
            <p className="text-sm text-text-muted">Totals in BDT · click an order for details</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SearchBox label="Search orders" value={query} onChange={setQuery} placeholder="Search order, product, customer" />
            <Segmented
              label="Order status"
              value={tab}
              onChange={(v) => setTab(v as Tab)}
              options={[{ value: "ALL", label: "All" }, ...ORDER_STATES.map((s) => ({ value: s, label: FULFILL[s].label }))]}
            />
          </div>
        </div>

        {!data && !error && <div role="status" className="space-y-px p-6">{Array.from({ length: 5 }, (_, i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-surface mb-2" />)}</div>}

        {data && rows.length === 0 && (
          <div className="px-6 py-16 text-center">
            <p className="font-medium">No orders here</p>
            <p className="mt-1 text-sm text-text-muted">Try another status or clear the search.</p>
          </div>
        )}

        {data && rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <caption className="sr-only">Orders</caption>
              <thead className="bg-surface text-xs uppercase tracking-wider text-text-muted">
                <tr>
                  <th scope="col" className="px-6 py-3 font-medium">Order ID</th>
                  <th scope="col" className="px-4 py-3 font-medium">Customer</th>
                  <th scope="col" className="px-4 py-3 font-medium">Product</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Qty</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Total</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  <th scope="col" className="px-4 py-3 font-medium">Placed</th>
                  <th scope="col" className="px-6 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((i) => {
                  const next = NEXT_STEP[i.fulfillmentStatus];
                  return (
                    <tr key={i.itemId} className="hover:bg-surface">
                      <td className="px-6 py-4">
                        <button onClick={() => setSelected(i)} className="font-medium tabular-nums underline-offset-4 hover:underline">
                          #{shortId(i.orderId)}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={i.shippingAddress.fullName} />
                          <div>
                            <p>{i.shippingAddress.fullName}</p>
                            <p className="text-xs text-text-muted">{i.shippingAddress.city}</p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[220px] truncate px-4 py-4 text-text-muted">{i.productName}</td>
                      <td className="px-4 py-4 text-right tabular-nums">{i.quantity}</td>
                      <td className="px-4 py-4 text-right font-medium tabular-nums">{formatMoney(i.lineTotalCents, i.currency)}</td>
                      <td className="px-4 py-4"><Pill tone={FULFILL[i.fulfillmentStatus].tone}>{FULFILL[i.fulfillmentStatus].label}</Pill></td>
                      <td className="px-4 py-4 text-text-muted">{timeAgo(i.placedAt)}</td>
                      <td className="px-6 py-4 text-right">
                        {next ? (
                          <Button variant="light" className="min-h-9 px-3 text-xs" disabled={busyId === i.itemId} onClick={() => advance(i)}>
                            {busyId === i.itemId ? "Saving…" : next.label}
                          </Button>
                        ) : (
                          <button onClick={() => setSelected(i)} className="text-xs text-text-muted underline underline-offset-4">View</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {data && data.totalPages > 1 && (
          <nav aria-label="Order pages" className="flex items-center justify-end gap-2 border-t border-border px-6 py-4 text-sm">
            <span className="mr-2 tabular-nums text-text-muted">Page {page + 1} of {data.totalPages}</span>
            <Button variant="light" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="light" disabled={page >= data.totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </nav>
        )}
      </Card>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onMouseDown={() => setSelected(null)}>
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={`Order ${shortId(selected.orderId)}`}
            onMouseDown={(e) => e.stopPropagation()}
            className="flex h-full w-full max-w-md flex-col bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <p className="text-xs text-text-muted">Order</p>
                <h2 className="font-semibold tabular-nums">#{shortId(selected.orderId)}</h2>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-xl hover:bg-surface"><Icon name="close" size={18} /></button>
            </div>
            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              <Pill tone={FULFILL[selected.fulfillmentStatus].tone}>{FULFILL[selected.fulfillmentStatus].label}</Pill>
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Customer</h3>
                <p className="mt-2 font-medium">{selected.shippingAddress.fullName}</p>
                <p className="text-sm text-text-muted">{selected.shippingAddress.phone}</p>
                <p className="mt-1 text-sm text-text-muted">
                  {[selected.shippingAddress.line1, selected.shippingAddress.line2, selected.shippingAddress.city, selected.shippingAddress.postalCode].filter(Boolean).join(", ")}
                </p>
              </section>
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Item</h3>
                <div className="mt-2 flex justify-between gap-4 rounded-xl border border-border p-4 text-sm">
                  <div>
                    <p className="font-medium">{selected.productName}</p>
                    <p className="text-text-muted">{selected.quantity} × {formatMoney(selected.unitPriceCents, selected.currency)}</p>
                  </div>
                  <p className="font-semibold tabular-nums">{formatMoney(selected.lineTotalCents, selected.currency)}</p>
                </div>
              </section>
              <p className="text-xs text-text-muted">Placed {timeAgo(selected.placedAt)}</p>
            </div>
            <div className="border-t border-border p-5">
              {NEXT_STEP[selected.fulfillmentStatus] ? (
                <Button variant="dark" className="w-full" disabled={busyId === selected.itemId} onClick={() => advance(selected)}>
                  {NEXT_STEP[selected.fulfillmentStatus]!.label}
                </Button>
              ) : (
                <p className="text-center text-sm text-text-muted">No further status changes for this order.</p>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function StatCard({
  label,
  value,
  onClick,
  active,
  tone,
}: {
  label: string;
  value: number;
  onClick: () => void;
  active: boolean;
  tone?: "amber" | "blue" | "violet" | "green" | "red" | "stone";
}) {
  const dot: Record<string, string> = { amber: "bg-tone-amber-dot", blue: "bg-tone-blue-dot", violet: "bg-tone-violet-dot", green: "bg-tone-green-dot", red: "bg-tone-red-dot", stone: "bg-tone-stone-dot" };
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-2xl border bg-card p-5 text-left transition ${
        active ? "border-text ring-1 ring-text" : "border-border hover:border-text/40"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">{label}</p>
        <span className={`h-2 w-2 rounded-full ${dot[tone ?? "stone"]}`} aria-hidden="true" />
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
    </button>
  );
}

function exportCsv(rows: VendorOrderItemResponse[]) {
  const header = ["Order ID", "Product", "Customer", "Quantity", "Total", "Status", "Placed"];
  const body = rows.map((i) => [
    i.orderId,
    i.productName,
    i.shippingAddress.fullName,
    i.quantity,
    (i.lineTotalCents / 100).toFixed(2),
    FULFILL[i.fulfillmentStatus].label,
    i.placedAt,
  ]);
  const csv = [header, ...body].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "shopstream-orders.csv";
  a.click();
  URL.revokeObjectURL(url);
}