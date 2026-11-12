// apps/web/src/app/account/orders/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { orderStatusBadge } from "@/components/Badge";
import { orderApi } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { formatMoney, formatDateTime } from "@/lib/money";
import { useToast } from "@/components/Toast";
import type { OrderResponse } from "@/lib/types";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) { router.push("/auth/login"); return; }
    orderApi.get(Number(id))
      .then(setOrder)
      .catch(() => router.push("/account/orders"))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function cancel() {
    if (!order) return;
    setCancelling(true);
    try {
      const updated = await orderApi.cancel(order.id);
      setOrder(updated);
      toast("Order cancelled.", "success");
    } catch {
      toast("Could not cancel.", "error");
    } finally {
      setCancelling(false);
    }
  }

  async function mockPay() {
    if (!order) return;
    setPaying(true);
    try {
      const res = await orderApi.pay(order.id, "MOCK");
      toast("Payment initiated!", "success");
      // poll or refetch
      setTimeout(async () => {
        const updated = await orderApi.get(order.id);
        setOrder(updated);
        setPaying(false);
      }, 1500);
      void res;
    } catch {
      toast("Payment failed.", "error");
      setPaying(false);
    }
  }

  if (loading || !order) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <Nav />
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="h-64 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />
        </div>
      </div>
    );
  }

  const canCancel = order.status === "PENDING" || order.status === "AWAITING_PAYMENT";
  const canPay = order.status === "AWAITING_PAYMENT" || order.status === "PENDING";

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/account/orders" className="text-sm" style={{ color: "var(--text-muted)" }}>
            ← Orders
          </Link>
        </div>

        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <div>
              <p className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
                Order #{order.id}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Placed {formatDateTime(order.createdAt)}
              </p>
            </div>
            {orderStatusBadge(order.status)}
          </div>

          {/* Items */}
          <div className="px-6 py-5 flex flex-col gap-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                    {item.productName}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    Qty {item.quantity} × {formatMoney(item.unitPriceCents, item.currency)}
                  </p>
                </div>
                <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                  {formatMoney(item.unitPriceCents * item.quantity, item.currency)}
                </span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="px-6 py-4 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>Total</span>
            <span className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
              {formatMoney(order.totalCents, order.currency)}
            </span>
          </div>

          {/* Actions */}
          {(canPay || canCancel) && (
            <div className="px-6 py-5 border-t flex gap-3" style={{ borderColor: "var(--border)" }}>
              {canPay && (
                <button
                  onClick={mockPay}
                  disabled={paying}
                  className="flex-1 h-11 rounded-xl bg-[#E8F44A] text-zinc-900 font-semibold text-sm disabled:opacity-60"
                >
                  {paying ? "Processing..." : "Pay Now (Mock)"}
                </button>
              )}
              {canCancel && (
                <button
                  onClick={cancel}
                  disabled={cancelling}
                  className="h-11 px-5 rounded-xl border text-sm font-medium disabled:opacity-60"
                  style={{ borderColor: "var(--border)", color: "var(--text)" }}
                >
                  {cancelling ? "Cancelling..." : "Cancel"}
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}