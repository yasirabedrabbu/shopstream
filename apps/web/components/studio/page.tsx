"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { vendorApi } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { getUser } from "@/lib/auth";
import type { FulfillmentStatus, VendorDashboardResponse, VendorOrderItemResponse } from "@/lib/types";
import { Avatar, Card, DotSpark, FULFILL, PageHeader, Pill, Skeleton, shortId, timeAgo, todayLabel } from "@/components/studio/ui";

const STATUSES: FulfillmentStatus[] = ["NEW", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function StudioOverviewPage() {
  const user = getUser();
  const [dash, setDash] = useState<VendorDashboardResponse | null>(null);
  const [items, setItems] = useState<VendorOrderItemResponse[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([vendorApi.dashboard("30d"), vendorApi.orderItems(0)])
      .then(([d, o]) => {
        if (!active) return;
        setDash(d);
        setItems(o.content);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Overview could not be loaded.");
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {error}
      </p>
    );
  }

  if (!dash || !items) {
    return (
      <div className="space-y-6" role="status">
        <Skeleton className="h-16 w-1/3" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  const currency = dash.currency ?? "BDT";
  const last14 = dash.daily.slice(-14);
  const sparkValues = last14.map((d) => d.grossCents);
  const pending = dash.pipeline.NEW ?? 0;
  const lowStock = dash.lowStock.length;
  const pipelineTotal = STATUSES.reduce((sum, s) => sum + (dash.pipeline[s] ?? 0), 0) || 1;

  const kpis = [
    { label: "Gross revenue", value: formatMoney(dash.revenue.grossCents, currency), hint: "Confirmed orders, selected period", href: "/studio/orders" },
    { label: "Net earnings", value: formatMoney(dash.revenue.netCents, currency), hint: "After platform commission", href: "/studio/orders" },
    { label: "Orders", value: String(dash.revenue.orders), hint: "Placed in the selected period", href: "/studio/orders" },
    { label: "Low stock", value: String(lowStock), hint: "Products below 10 units", href: "/studio/inventory" },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome back${user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}`}
        subtitle={`${todayLabel()} · Here is how your store is doing.`}
        actions={
          <>
            <Link href="/studio/inventory" className="inline-flex min-h-10 items-center rounded-xl border border-stone-200 bg-white px-4 text-sm font-medium hover:border-stone-400">
              Inventory
            </Link>
            <Link href="/vendor/products/new" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-medium text-white hover:bg-orange-600">
              New product
              <span aria-hidden="true">+</span>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <Link key={k.label} href={k.href} className="group">
            <Card className="h-full p-5 transition group-hover:border-stone-300">
              <div className="flex items-start justify-between">
                <p className="text-sm text-stone-500">{k.label}</p>
                <span aria-hidden="true" className="text-stone-400 transition group-hover:text-stone-900">↗</span>
              </div>
              <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight md:text-[28px]">{k.value}</p>
              <p className="mt-2 text-xs text-stone-500">{k.hint}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">Daily revenue</h2>
              <p className="text-sm text-stone-500">Last 14 days · each column is one day</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span className="h-2 w-2 rounded-full bg-orange-500" /> Gross revenue
            </div>
          </div>
          <div className="mt-6">
            {sparkValues.length > 0 && sparkValues.some((v) => v > 0) ? (
              <DotSpark values={sparkValues} rows={8} dot={6} gap={5} />
            ) : (
              <p className="py-12 text-center text-sm text-stone-500">No sales in this period yet.</p>
            )}
          </div>
          <div className="mt-4 flex justify-between text-xs tabular-nums text-stone-400">
            <span>{last14[0] ? new Date(last14[0].date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : ""}</span>
            <span>{last14.at(-1) ? new Date(last14.at(-1)!.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : ""}</span>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold">Order pipeline</h2>
          <p className="text-sm text-stone-500">Items by fulfilment stage</p>
          <div className="mt-5 space-y-4">
            {STATUSES.map((s) => {
              const count = dash.pipeline[s] ?? 0;
              return (
                <div key={s} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <Pill tone={FULFILL[s].tone}>{FULFILL[s].label}</Pill>
                    <span className="tabular-nums font-medium">{count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
                    <div className="h-full rounded-full bg-stone-900" style={{ width: `${(count / pipelineTotal) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <Link href="/studio/orders" className="mt-6 inline-flex text-sm font-medium underline underline-offset-4">
            Manage orders
          </Link>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold">Recent transactions</h2>
            <p className="text-sm text-stone-500">Latest order items across your store</p>
          </div>
          <Link href="/studio/orders" className="text-sm font-medium underline underline-offset-4">
            View all
          </Link>
        </div>
        {items.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-stone-500">No transactions yet. Orders will appear here.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <caption className="sr-only">Recent transactions</caption>
              <thead className="bg-stone-50 text-xs uppercase tracking-wider text-stone-500">
                <tr>
                  <th scope="col" className="px-6 py-3 font-medium">Order</th>
                  <th scope="col" className="px-4 py-3 font-medium">Customer</th>
                  <th scope="col" className="px-4 py-3 font-medium">Product</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Qty</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Revenue</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  <th scope="col" className="px-6 py-3 text-right font-medium">Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {items.slice(0, 8).map((i) => (
                  <tr key={i.itemId} className="hover:bg-stone-50">
                    <td className="px-6 py-4 font-medium tabular-nums">#{shortId(i.orderId)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={i.shippingAddress.fullName} />
                        <span>{i.shippingAddress.fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-stone-600">{i.productName}</td>
                    <td className="px-4 py-4 text-right tabular-nums">{i.quantity}</td>
                    <td className="px-4 py-4 text-right font-medium tabular-nums">{formatMoney(i.lineTotalCents, i.currency)}</td>
                    <td className="px-4 py-4"><Pill tone={FULFILL[i.fulfillmentStatus].tone}>{FULFILL[i.fulfillmentStatus].label}</Pill></td>
                    <td className="px-6 py-4 text-right text-stone-500">{timeAgo(i.placedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}