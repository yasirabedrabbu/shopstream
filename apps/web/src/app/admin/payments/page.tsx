// apps/web/src/app/admin/payments/page.tsx
"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { Badge } from "@/components/Badge";
import { useToast } from "@/components/Toast";
import { formatMoney, formatDateTime } from "@/lib/money";
import type { PaymentReviewResponse } from "@/lib/types";

export default function AdminPaymentsPage() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refunding, setRefunding] = useState<number | null>(null);

  useEffect(() => {
    adminApi.payments().then((data) => setPayments(data.content)).finally(() => setLoading(false));
  }, []);

  async function refund(id: number) {
    if (!confirm("Issue refund for this payment?")) return;
    setRefunding(id);
    try {
      await adminApi.refund(id);
      setPayments((prev) => prev.filter((p) => p.id !== id));
      toast("Refund issued.", "success");
    } catch {
      toast("Refund failed.", "error");
    } finally {
      setRefunding(null);
    }
  }

  const reasonLabel: Record<string, string> = {
    HELD: "Held",
    LATE_PAYMENT: "Late Payment",
    AMOUNT_MISMATCH: "Amount Mismatch",
    DUPLICATE_CHARGE: "Duplicate Charge",
  };

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
        Payment Review
      </h1>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div
          className="rounded-2xl border p-10 text-center"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          No payments under review.
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--surface)", borderBottom: `1px solid var(--border)` }}>
                {["Order", "Amount", "Reason", "Date", "Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} style={{ borderBottom: `1px solid var(--border)`, background: "var(--bg)" }}>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                    #{p.orderId}
                  </td>
                  <td className="px-4 py-3 font-semibold" style={{ color: "var(--text)" }}>
                    {formatMoney(p.amountCents, p.currency)}
                  </td>
                  <td className="px-4 py-3">
                    {p.reviewReason && (
                      <Badge variant="warning">{reasonLabel[p.reviewReason] ?? p.reviewReason}</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                    {formatDateTime(p.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => refund(p.id)}
                      disabled={refunding === p.id}
                      className="px-3 py-1.5 rounded-lg border text-xs font-medium text-red-500 border-red-200 dark:border-red-900 disabled:opacity-60"
                    >
                      {refunding === p.id ? "..." : "Refund"}
                    </button>
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