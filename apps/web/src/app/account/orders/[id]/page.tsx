// apps/web/src/app/account/orders/[id]/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
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
  const [busy, setBusy] = useState<"pay" | "cancel" | null>(null);

  const load = useCallback(() => {
    return orderApi.get(id).then(setOrder);
  }, [id]);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/auth/login");
      return;
    }
    load()
      .catch(() => router.replace("/account/orders"))
      .finally(() => setLoading(false));
  }, [load, router]);

  async function pay() {
    if (!order) return;
    setBusy("pay");
    try {
      const session = await orderApi.pay(order.id, "MOCK");
      await orderApi.mockConfirm(session.providerReference);
      await load();
      toast("Payment successful.", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Payment failed.", "error");
    } finally {
      setBusy(null);
    }
  }

  async function cancel() {
    if (!order) return;
    setBusy("cancel");
    try {
      const updated = await orderApi.cancel(order.id);
      setOrder(updated);
      toast("Order cancelled.", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not cancel.", "error");
    } finally {
      setBusy(null);
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

  const canPay = order.status === "PENDING" || order.status === "AWAITING_PAYMENT";
  const canCancel = canPay;
  const addr = order.shippingAddress;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-6">
          <Link
            href="/account/orders"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            <Icon name="arrowLeft" size={16} />
            Orders
          </Link>
        </div>

        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <div>
              <p className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
                Order #{order.id.slice(0, 8)}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Placed {formatDateTime(order.createdAt)}
              </p>
            </div>
            {orderStatusBadge(order.status)}
          </div>

          <div className="px-6 py-5 flex flex-col gap-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                    {item.productName}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    Qty {item.quantity} × {formatMoney(item.unitPriceCents, order.currency)}
                  </p>
                </div>
                <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                  {formatMoney(item.lineTotalCents, order.currency)}
                </span>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 border-t" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
              Shipping to
            </p>
            <p className="text-sm" style={{ color: "var(--text)" }}>
              {addr.fullName}, {addr.phone}
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {[addr.line1, addr.line2, addr.city, addr.state, addr.postalCode, addr.countryCode]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>

          <div className="px-6 py-4 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
              Total
            </span>
            <span className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
              {formatMoney(order.totalCents, order.currency)}
            </span>
          </div>

          {order.cancelReason && (
            <div className="px-6 py-3 border-t text-sm" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
              Cancelled: {order.cancelReason}
            </div>
          )}

          {(canPay || canCancel) && (
            <div className="px-6 py-5 border-t flex gap-3" style={{ borderColor: "var(--border)" }}>
              {canPay && (
                <button
                  onClick={pay}
                  disabled={busy !== null}
                  className="flex-1 h-11 rounded-xl bg-[#E8F44A] text-zinc-900 font-semibold text-sm disabled:opacity-60"
                >
                  {busy === "pay" ? "Processing..." : "Pay now (mock)"}
                </button>
              )}
              {canCancel && (
                <button
                  onClick={cancel}
                  disabled={busy !== null}
                  className="h-11 px-5 rounded-xl border text-sm font-medium disabled:opacity-60"
                  style={{ borderColor: "var(--border)", color: "var(--text)" }}
                >
                  {busy === "cancel" ? "Cancelling..." : "Cancel"}
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}