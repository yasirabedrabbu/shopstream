// apps/web/src/components/ProductForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import type { CategoryResponse, ProductStatus } from "@/lib/types";
import type { ProductWriteBody } from "@/lib/api";

export interface ProductFormValues {
  name: string;
  description: string;
  price: string;
  stock: string;
  categoryId: string;
  status: Exclude<ProductStatus, "BLOCKED">;
  imageUrls: string;
}

interface ProductFormProps {
  title: string;
  categories: CategoryResponse[];
  initial: ProductFormValues;
  submitLabel: string;
  onSubmit: (body: ProductWriteBody) => Promise<unknown>;
}

const inputStyle = { background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" };

export function ProductForm({ title, categories, initial, submitLabel, onSubmit }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<ProductFormValues>(initial);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.categoryId) {
      toast("Select a category.", "error");
      return;
    }

    const priceCents = Math.round(parseFloat(form.price) * 100);
    const stockQuantity = parseInt(form.stock, 10);
    if (!Number.isFinite(priceCents) || priceCents < 0) {
      toast("Enter a valid price.", "error");
      return;
    }
    if (!Number.isFinite(stockQuantity) || stockQuantity < 0) {
      toast("Enter a valid stock quantity.", "error");
      return;
    }

    const imageUrls = form.imageUrls
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        priceCents,
        currency: "BDT",
        stockQuantity,
        categoryId: form.categoryId,
        status: form.status,
        imageUrls,
      });
      toast("Saved.", "success");
      router.push("/vendor/products");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
        {title}
      </h1>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Product name">
          <input
            type="text"
            required
            maxLength={200}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="h-11 px-4 rounded-xl border text-sm outline-none focus:border-[#E8F44A]"
            style={inputStyle}
          />
        </Field>

        <Field label="Price (৳)">
          <input
            type="number"
            required
            min={0}
            step="0.01"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            className="h-11 px-4 rounded-xl border text-sm outline-none focus:border-[#E8F44A]"
            style={inputStyle}
          />
        </Field>

        <Field label="Stock quantity">
          <input
            type="number"
            required
            min={0}
            value={form.stock}
            onChange={(e) => set("stock", e.target.value)}
            className="h-11 px-4 rounded-xl border text-sm outline-none focus:border-[#E8F44A]"
            style={inputStyle}
          />
        </Field>

        <Field label="Category">
          <select
            required
            value={form.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
            className="h-11 px-4 rounded-xl border text-sm outline-none focus:border-[#E8F44A]"
            style={inputStyle}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Description">
          <textarea
            rows={4}
            maxLength={5000}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="px-4 py-3 rounded-xl border text-sm outline-none focus:border-[#E8F44A] resize-none"
            style={inputStyle}
          />
        </Field>

        <Field label="Image URLs (comma separated, https only)">
          <input
            type="text"
            value={form.imageUrls}
            onChange={(e) => set("imageUrls", e.target.value)}
            placeholder="https://..., https://..."
            className="h-11 px-4 rounded-xl border text-sm outline-none focus:border-[#E8F44A]"
            style={inputStyle}
          />
        </Field>

        <Field label="Status">
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value as ProductFormValues["status"])}
            className="h-11 px-4 rounded-xl border text-sm outline-none focus:border-[#E8F44A]"
            style={inputStyle}
          >
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </Field>

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
            {saving ? "Saving..." : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium" style={{ color: "var(--text)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}