"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AccountFrame } from "@/components/account/AccountFrame";
import { orderApi } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import type { OrderResponse } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  AWAITING_PAYMENT: "Awaiting payment",
  PAID: "Paid",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[] | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setOrders(null);
    orderApi
      .list(page)
      .then((data) => {
        if (cancelled) return;
        setOrders(data.content);
        setTotalPages(data.totalPages);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Orders could not be loaded.");
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <AccountFrame title="Your orders" subtitle="Track every find from checkout to doorstep.">
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      {!orders && !error && (
        <p role="status" className="text-text-muted">
          Loading orders…
        </p>
      )}
      {orders && orders.length === 0 && (
        <div className="rounded-xl border border-border bg-surface px-6 py-16 text-center">
          <h2 className="text-xl font-semibold">No orders yet.</h2>
          <Link
            href="/products"
            className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-accent px-5 font-medium text-accent-text"
          >
            Start shopping
          </Link>
        </div>
      )}
      {orders && orders.length > 0 && (
        <ul className="flex flex-col gap-4">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/account/orders/${order.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4 hover:bg-surface"
              >
                <div>
                  <p className="font-medium">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-text-muted">
                    {new Date(order.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    · {order.items.length} {order.items.length === 1 ? "item" : "items"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatMoney(order.totalCents, order.currency)}</p>
                  <p className="text-sm text-text-muted">{STATUS_LABEL[order.status] ?? order.status}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center gap-3">
          <button
            className="min-h-11 rounded-xl border border-border px-4 disabled:opacity-40"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="text-sm text-text-muted">
            Page {page + 1} of {totalPages}
          </span>
          <button
            className="min-h-11 rounded-xl border border-border px-4 disabled:opacity-40"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </AccountFrame>
  );
}