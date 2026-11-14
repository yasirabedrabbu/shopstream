// apps/web/src/app/account/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { orderStatusBadge } from "@/components/Badge";
import { orderApi } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { formatMoney, formatDate } from "@/lib/money";
import type { OrderResponse } from "@/lib/types";
import { DEMO_MODE } from "@/lib/demo";
import { DemoAccountNotice } from "@/components/DemoAccountNotice";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) return;
    if (!isLoggedIn()) {
      router.push("/auth/login");
      return;
    }
    orderApi
      .list()
      .then((data) => setOrders(data.content))
      .finally(() => setLoading(false));
  }, [router]);

  if (DEMO_MODE) return <DemoAccountNotice kind="orders" />;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1
          className="text-2xl font-bold mb-6"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}
        >
          My Orders
        </h1>

        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-2xl animate-pulse"
                style={{ background: "var(--surface)" }}
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div
            className="text-center py-24"
            style={{ color: "var(--text-muted)" }}
          >
            No orders yet.{" "}
            <Link
              href="/products"
              className="underline"
              style={{ color: "var(--text)" }}
            >
              Shop now
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/account/orders/${o.id}`}
                className="flex items-center justify-between p-5 rounded-2xl border hover:border-[#E8F44A] transition-colors"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex flex-col gap-1">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--text)" }}
                  >
                    Order #{o.id}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {formatDate(o.createdAt)} · {o.items.length} item
                    {o.items.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className="text-sm font-bold"
                    style={{ color: "var(--text)" }}
                  >
                    {formatMoney(o.totalCents, o.currency)}
                  </span>
                  {orderStatusBadge(o.status)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
