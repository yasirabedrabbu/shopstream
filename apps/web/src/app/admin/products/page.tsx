// apps/web/src/app/admin/products/page.tsx
"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { productStatusBadge } from "@/components/Badge";
import { useToast } from "@/components/Toast";
import { formatMoney } from "@/lib/money";
import type { AdminProductResponse } from "@/lib/types";

export default function AdminProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<AdminProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    adminApi.products().then((data) => setProducts(data.content)).finally(() => setLoading(false));
  }, []);

  async function toggle(p: AdminProductResponse) {
    setUpdating(p.id);
    try {
      if (p.status === "BLOCKED") {
        await adminApi.unblockProduct(p.id);
        setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, status: "ACTIVE" } : x));
        toast("Product unblocked.", "success");
      } else {
        await adminApi.blockProduct(p.id);
        setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, status: "BLOCKED" } : x));
        toast("Product blocked.", "success");
      }
    } catch {
      toast("Failed.", "error");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
        Products
      </h1>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />
          ))}