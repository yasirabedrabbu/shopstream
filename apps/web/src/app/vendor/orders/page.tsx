// apps/web/src/app/vendor/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import { vendorApi } from "@/lib/api";
import { Badge } from "@/components/Badge";
import { formatMoney } from "@/lib/money";

interface VendorOrderItem {
  id: number;
  orderId: number;
  status: string;
  productName: string;
  quantity: number;
  unitPriceCents: number;
}

export default function VendorOrdersPage() {
  const [items, setItems] = useState<VendorOrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vendorApi.orders().then((data) => setItems(data.content)).finally(() => setLoading(false));
  }, []);

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
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--surface)", borderBottom: `1px solid var(--border)` }}>
                {["Order #", "Product", "Qty", "Total", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{ borderBottom: `1px solid var(--border)`, background: "var(--bg)" }}>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text-muted)" }}>#{item.orderId}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--text)" }}>{item.productName}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text)" }}>{item.quantity}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--text)" }}>
                    {formatMoney(item.unitPriceCents * item.quantity, "BDT")}
                  </td>
                  <td className="px-4 py-3">
                    <Badge>{item.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}