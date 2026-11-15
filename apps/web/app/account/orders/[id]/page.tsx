"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AccountFrame } from "@/components/account/AccountFrame";
import { orderApi } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import type { FulfillmentStatus, OrderResponse } from "@/lib/types";

const ORDER_LABEL: Record<string, string> = {
  PENDING: "Pending",
  AWAITING_PAYMENT: "Awaiting payment",
  PAID: "Paid",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

const ITEM_LABEL: Record<FulfillmentStatus, string> = {
  NEW: "Preparing",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

function errorText(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loadError, setLoadError] = useState("");
  const [payError, setPayError] = useState("");
  const [paying, setPaying] = useState(false);

  const load = useCallback(() => {
    return orderApi
      .get(id)
      .then((o) => {
        setOrder(o);
        setLoadError("");
      })
      .catch((err) => {
        setLoadError(errorText(err, "This order could not be loaded."));
      });
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    orderApi.get(id).then((o) => {
      if (!cancelled) setOrder(o);
    }).catch((err) => {
      if (!cancelled) setLoadError(errorText(err, "This order could not be loaded."));
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Pay for an order that is still waiting for payment (or whose payment failed).
  async function payNow() {
    if (!order || paying) return;
    setPaying(true);
    setPayError("");
    try {
      const session = await orderApi.pay(order.id, "SSLCOMMERZ");
      if (session.redirectUrl) {
        window.location.assign(session.redirectUrl);
        return;
      }
      setPayError("Payment could not be started. Please try again in a moment.");
    } catch (err) {
      setPayError(errorText(err, "Payment could not be started. Please try again."));
    } finally {
      setPaying(false);
    }
  }

  const canPay = order?.status === "AWAITING_PAYMENT" || order?.status === "PENDING";
  const addr = order?.shippingAddress;

  return (
    <AccountFrame
      title={order ? `Order #${order.id.slice(0, 8).toUpperCase()}` : "Order"}
      subtitle={order ? ORDER_LABEL[order.status] ?? order.status : undefined}
    >
      <Link href="/account/orders" className="text-sm underline underline-offset-4">
        Back to orders
      </Link>

      {loadError && (
        <div role="alert" className="mt-6 rounded-xl border border-danger p-4 text-sm text-danger">
          <p>{loadError}</p>
          <button
            onClick={() => {
              setLoadError("");
              load();
            }}
            className="mt-3 min-h-11 rounded-xl border border-border px-4 text-text"
          >
            Try again
          </button>
        </div>
      )}

      {!order && !loadError && (
        <p role="status" className="mt-6 text-text-muted">
          Loading order…
        </p>
      )}

      {order && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-xl border border-border p-5">
            <h2 className="font-semibold">Items</h2>
            <ul className="mt-4 flex flex-col gap-4">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4 text-sm">
                  <span>
                    {item.productName} × {item.quantity}
                    <span className="block text-text-muted">
                      {ITEM_LABEL[item.fulfillmentStatus] ?? item.fulfillmentStatus}
                    </span>
                  </span>
                  <span>{formatMoney(item.lineTotalCents, order.currency)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex justify-between border-t border-border pt-4 font-semibold">
              <span>Total</span>
              <span>{formatMoney(order.totalCents, order.currency)}</span>
            </div>
          </section>

          <aside className="flex flex-col gap-6">
            {addr && (
              <section className="rounded-xl border border-border p-5 text-sm">
                <h2 className="font-semibold">Delivery address</h2>
                <p className="mt-3">{addr.fullName}</p>
                <p className="text-text-muted">{addr.phone}</p>
                <p className="mt-2 text-text-muted">
                  {[addr.line1, addr.line2, addr.city, addr.state, addr.postalCode, addr.countryCode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </section>
            )}

            {canPay && (
              <section className="rounded-xl border border-border p-5 text-sm">
                <h2 className="font-semibold">Payment</h2>
                <p className="mt-2 text-text-muted">
                  This order is waiting for payment. You can pay now or try again if a payment
                  did not go through.
                </p>
                {payError && (
                  <p role="alert" className="mt-3 text-danger">
                    {payError}
                  </p>
                )}
                <button
                  onClick={payNow}
                  disabled={paying}
                  className="mt-4 min-h-12 w-full rounded-xl bg-accent px-5 font-medium text-accent-text disabled:opacity-60"
                >
                  {paying ? "Opening payment…" : "Pay now"}
                </button>
              </section>
            )}

            {order.status === "PAID" && (
              <p className="text-sm text-text-muted">Payment received. Thank you for your order.</p>
            )}

            {order.status === "EXPIRED" && (
              <p className="text-sm text-text-muted">
                This order expired before payment was completed. Please place a new order.
              </p>
            )}

            {order.cancelReason && (
              <p className="text-sm text-text-muted">Reason: {order.cancelReason}</p>
            )}
          </aside>
        </div>
      )}
    </AccountFrame>
  );
}