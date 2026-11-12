// apps/web/src/app/vendor/products/new/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { vendorApi, categoryApi } from "@/lib/api";
import { useToast } from "@/components/Toast";
import type { CategoryResponse } from "@/lib/types";

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    priceCents: "",
    stockQuantity: "",
    categoryId: "",
    status: "ACTIVE",
    imageUrls: "",
  });

  useEffect(() => {
    categoryApi.list().then(setCategories);
  }, []);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.categoryId) { toast("Select a category.", "error"); return; }
    setLoading(true);
    try {
      await vendorApi.createProduct({
        name: form.name,
        description: form.description || undefined,
        priceCents: Math.round(parseFloat(form.priceCents) * 100),
        currency: "BDT",
        stockQuantity: parseInt(form.stockQuantity),
        categoryId: parseInt(form.categoryId),
        status: form.status,
        imageUrls: form.imageUrls ? form.imageUrls.split(",").map((s) => s.trim()).filter(Boolean) : [],
      });
      toast("Product created!", "success");
      router.push("/vendor/products");
    } catch {
      toast("Failed to create product.", "error");
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { label: "Product Name", field: "name", type: "text", required: true },
    { label: "Price (৳)", field: "priceCents", type: "number", required: true, placeholder: "e.g. 1500" },
    { label: "Stock Quantity", field: "stockQuantity", type: "number", required: true },
    { label: "Image URLs (comma separated)", field: "imageUrls", type: "text", required: false },
  ];

  return (
    <div className="p-6 max-w-xl">
      <h1
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}
      >
        New Product
      </h1>

      <form onSubmit={submit} className="flex flex-col gap-4">
        {fields.map(({ label, field, type, required, placeholder }) => (
          <div key={field} className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--text)" }}>{label}</label>
            <input
              type={type}
              required={required}
              placeholder={placeholder}
              value={form[field as keyof typeof form]}
              onChange={(e) => set(field, e.target.value)}
              className="h-11 px-4 rounded-xl border text-sm outline-none focus:border-[#E8F44A]"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>
        ))}

        {/* Description */}
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

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--text)" }}>Category</label>
          <select
            value={form.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
            className="h-11 px-4 rounded-xl border text-sm outline-none focus:border-[#E8F44A]"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Status */}
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
            disabled={loading}
            className="flex-1 h-11 rounded-xl bg-[#E8F44A] text-zinc-900 font-semibold text-sm disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}