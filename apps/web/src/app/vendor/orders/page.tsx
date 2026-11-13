// apps/web/src/app/vendor/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import { vendorApi } from "@/lib/api";
import { Badge } from "@/components/Badge";
import { useToast } from "@/components/Toast";
import { formatMoney, formatDate } from "@/lib/money";
import type { FulfillmentStatus, VendorOrderItemResponse } from "@/lib/types";

const NEXT: Partial<Record<FulfillmentStatus, FulfillmentStatus>> = {
  NEW: "PACKED",
  PACKED: "SHIPPED",
  SHIPPED: "DELIVERED",
};

const NEXT_LABEL: Record<string, string> = {
  PACKED: "Mark packed",
  SHIPPED: "Mark shipped",
  DELIVERED: "Mark delivered",
};

export default function VendorOrdersPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<VendorOrderItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    vendorApi
      .orderItems()
      .then((data) => setItems(data.content))
      .catch((err) => toast(err instanceof Error ? err.message : "Could not load orders.", "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  async function advance(item: VendorOrderItemResponse) {
    const next = NEXT[item.fulfillmentStatus];
    if (!next) return;
    setBusy(item.itemId);
    try {
      const updated = await vendorApi.advanceItem(item.itemId, next);
      setItems((prev) => prev.map((x) => (x.itemId === item.itemId ? updated : x)));
      toast(`Marked ${next.toLowerCase()}.`, "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Update failed.", "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
        Orders
      </h1>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-24" style={{ color: "var(--text-muted)" }}>No orders yet.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => {
            const next = NEXT[item.fulfillmentStatus];
            const addr = item.shippingAddress;
            return (
              <div
                key={item.itemId}
                className="rounded-2xl border p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>
                    {item.productName} × {item.quantity}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Order #{item.orderId.slice(0, 8)} · {formatDate(item.placedAt)} · {formatMoney(item.lineTotalCents, item.currency)}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                    {addr.fullName}, {addr.city} {addr.postalCode}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge>{item.fulfillmentStatus}</Badge>
                  {next && (
                    <button
                      onClick={() => advance(item)}
                      disabled={busy === item.itemId}
                      className="h-9 px-4 rounded-xl bg-[#E8F44A] text-zinc-900 text-xs font-semibold disabled:opacity-60 min-h-[44px]"
                    >
                      {busy === item.itemId ? "Saving..." : NEXT_LABEL[next]}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}