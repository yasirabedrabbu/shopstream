// apps/web/src/app/vendor/products/[id]/edit/page.tsx
"use client";

 

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { vendorApi, categoryApi } from "@/lib/api";
import { useToast } from "@/components/Toast";
import type { CategoryResponse, PublicProductResponse } from "@/lib/types";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    priceCents: "",
    stockQuantity: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    Promise.all([
      vendorApi.products(0),
      categoryApi.list(),
    ]).then(([data, cats]) => {
      const product = data.content.find((p: PublicProductResponse) => p.id === parseInt(id));
      if (product) {
        setForm({
          name: product.name,
          description: product.description ?? "",
          priceCents: (product.priceCents / 100).toString(),
          stockQuantity: product.stockQuantity.toString(),
          status: product.status,
        });
      }
      setCategories(cats);
    }).finally(() => setLoading(false));
  }, [id]);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await vendorApi.updateProduct(parseInt(id), {
        name: form.name,
        description: form.description || undefined,
        priceCents: Math.round(parseFloat(form.priceCents) * 100),
        stockQuantity: parseInt(form.stockQuantity),
        status: form.status,
      });
      toast("Product updated!", "success");
      router.push("/vendor/products");
    } catch {
      toast("Update failed.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-xl">
        <div className="h-64 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl">
      <h1
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}
      >
        Edit Product
      </h1>

      <form onSubmit={submit} className="flex flex-col gap-4">
        {[
          { label: "Product Name", field: "name", type: "text" },
          { label: "Price (৳)", field: "priceCents", type: "number" },
          { label: "Stock Quantity", field: "stockQuantity", type: "number" },
        ].map(({ label, field, type }) => (
          <div key={field} className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--text)" }}>{label}</label>
            <input
              type={type}
              required
              value={form[field as keyof typeof form]}
              onChange={(e) => set(field, e.target.value)}
              className="h-11 px-4 rounded-xl border text-sm outline-none focus:border-[#E8F44A]"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>
        ))}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--text)" }}>Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="px-4 py-3 rounded-xl border text-sm outline-none focus:border-[#E8F44A] resize-none"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--text)" }}>Status</label>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            className="h-11 px-4 rounded-xl border text-sm outline-none focus:border-[#E8F44A]"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
          >
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div className="flex gap-3 mt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 h-11 rounded-xl border text-sm font-medium"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 h-11 rounded-xl bg-[#E8F44A] text-zinc-900 font-semibold text-sm disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}