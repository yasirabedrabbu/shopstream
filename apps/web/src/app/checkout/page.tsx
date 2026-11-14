// apps/web/src/app/checkout/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Nav } from "@/components/Nav";
import { useToast } from "@/components/Toast";
import { productApi, orderApi } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import type { PublicProductResponse, ShippingAddress } from "@/lib/types";

const emptyAddress: ShippingAddress = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  countryCode: "BD",
};

function CheckoutContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const { toast } = useToast();

  const slug = sp.get("product") ?? "";
  const qty = Math.min(100, Math.max(1, parseInt(sp.get("qty") ?? "1", 10) || 1));

  const [product, setProduct] = useState<PublicProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [address, setAddress] = useState<ShippingAddress>(emptyAddress);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/auth/login");
      return;
    }
    if (!slug) {
      router.replace("/products");
      return;
    }
    productApi
      .get(slug)
      .then(setProduct)
      .catch(() => router.replace("/products"))
      .finally(() => setLoading(false));
  }, [slug, router]);

  function set<K extends keyof ShippingAddress>(field: K, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;

    setSubmitting(true);
    try {
      const order = await orderApi.create(
        [{ productId: product.id, quantity: qty }],
        {
          ...address,
          line2: address.line2 || null,
          state: address.state || null,
          countryCode: address.countryCode.toUpperCase(),
        },
      );
      toast("Order created. Complete payment to confirm.", "success");
      router.push(`/account/orders/${order.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create order.";
      toast(message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !product) {
    return <div className="max-w-3xl mx-auto px-4 py-12 h-64 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />;
  }

  const total = product.effectivePriceCents * qty;

  const fields: { label: string; field: keyof ShippingAddress; required: boolean; placeholder?: string }[] = [
    { label: "Full name", field: "fullName", required: true },
    { label: "Phone", field: "phone", required: true, placeholder: "01XXXXXXXXX" },
    { label: "Address line 1", field: "line1", required: true },
    { label: "Address line 2 (optional)", field: "line2", required: false },
    { label: "City", field: "city", required: true },
    { label: "District or state (optional)", field: "state", required: false },
    { label: "Postal code", field: "postalCode", required: true },
    { label: "Country code (2 letters)", field: "countryCode", required: true, placeholder: "BD" },
  ];

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex gap-2 text-sm mb-6" style={{ color: "var(--text-muted)" }}>
        <Link href={`/products/${product.slug}`} className="inline-flex min-h-11 items-center gap-1.5">
          <Icon name="arrowLeft" size={16} />
          Back to product
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
        Checkout
      </h1>

      <div className="grid md:grid-cols-5 gap-8">
        <form onSubmit={submit} className="md:col-span-3 flex flex-col gap-4">
          {fields.map(({ label, field, required, placeholder }) => (
            <div key={field} className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "var(--text)" }}>
                {label}
              </label>
              <input
                type="text"
                required={required}
                placeholder={placeholder}
                value={address[field] ?? ""}
                onChange={(e) => set(field, e.target.value)}
                className="h-11 px-4 rounded-xl border text-sm outline-none focus:border-[#E8F44A]"
                style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="h-11 rounded-xl bg-[#E8F44A] text-zinc-900 font-semibold text-sm disabled:opacity-60 mt-2"
          >
            {submitting ? "Placing order..." : "Place order"}
          </button>
        </form>

        <aside
          className="md:col-span-2 rounded-2xl border p-5 flex flex-col gap-3 h-fit"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {product.store.storeName}
          </p>
          <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            {product.name}
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {qty} × {formatMoney(product.effectivePriceCents, product.currency)}
          </p>
          <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>Total</span>
            <span className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
              {formatMoney(total, product.currency)}
            </span>
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Price is locked when the order is placed.
          </p>
        </aside>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />
      <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-12 h-64 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}