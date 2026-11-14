// apps/web/src/app/admin/payments/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { Badge } from "@/components/Badge";
import { Pager } from "@/components/Pager";
import { useToast } from "@/components/Toast";
import { formatMoney, formatDateTime } from "@/lib/money";
import type { AdminPaymentReviewResponse, PaymentReviewReason } from "@/lib/types";

const REASON_LABEL: Record<PaymentReviewReason, string> = {
  HELD: "Held",
  LATE_PAYMENT: "Late payment",
  AMOUNT_MISMATCH: "Amount mismatch",
  DUPLICATE_CHARGE: "Duplicate charge",
};

export default function AdminPaymentsPage() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<AdminPaymentReviewResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(
    (p: number) => {
      setLoading(true);
      adminApi
        .payments(p)
        .then((data) => {
          setPayments(data.content);
          setTotalPages(data.totalPages);
          setPage(p);
        })
        .catch((err) => toast(err instanceof Error ? err.message : "Could not load payments.", "error"))
        .finally(() => setLoading(false));
    },
    [toast],
  );

  useEffect(() => {
    load(0);
  }, [load]);

  async function resolve(p: AdminPaymentReviewResponse) {
    setBusy(p.paymentId);
    try {
      await adminApi.resolvePayment(p.paymentId);
      toast("Marked as resolved.", "success");
      load(page);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not resolve.", "error");
    } finally {
      setBusy(null);
    }
  }

  async function refund(p: AdminPaymentReviewResponse) {
    if (!confirm(`Refund ${formatMoney(p.amountCents, p.currency)} for this payment?`)) return;
    setBusy(p.paymentId);
    try {
      await adminApi.refund(p.paymentId);
      toast("Refund issued.", "success");
      load(page);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Refund failed.", "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
        Payment review
      </h1>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div className="rounded-2xl border p-10 text-center" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-muted)" }}>
          No payments under review.
        </div>
      ) : (
        <div className="rounded-2xl border overflow-x-auto" style={{ borderColor: "var(--border)" }}>
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
                {["Order", "Provider", "Amount", "Reason", "Date", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.paymentId} style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                    #{p.orderId.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--text)" }}>{p.provider}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: "var(--text)" }}>
                    {formatMoney(p.amountCents, p.currency)}
                  </td>
                  <td className="px-4 py-3">
                    {p.reviewReason ? <Badge variant="warning">{REASON_LABEL[p.reviewReason]}</Badge> : null}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                    {formatDateTime(p.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => resolve(p)}
                        disabled={busy === p.paymentId}
                        className="px-3 py-1.5 rounded-lg border text-xs font-medium disabled:opacity-60 min-h-[36px]"
                        style={{ borderColor: "var(--border)", color: "var(--text)" }}
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => refund(p)}
                        disabled={busy === p.paymentId || p.refundedAt !== null}
                        className="px-3 py-1.5 rounded-lg border text-xs font-medium text-red-500 border-red-200 dark:border-red-900 disabled:opacity-60 min-h-[36px]"
                      >
                        {p.refundedAt ? "Refunded" : "Refund"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pager page={page} totalPages={totalPages} onChange={load} />
    </div>
  );
}