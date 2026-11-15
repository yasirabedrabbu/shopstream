"use client";

import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "@/components/ui/SafeImage";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Icon } from "@/components/ui/Icon";
import { buttonClasses } from "@/components/ui/Button";
import { orderApi, productApi } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { useCart } from "@/lib/cart";
import type { PublicProductResponse } from "@/lib/types";

type AddressForm = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
};

type CheckoutItem = { product: PublicProductResponse; quantity: number };

const emptyAddress: AddressForm = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  countryCode: "BD",
};

const FIELDS: {
  key: Exclude<keyof AddressForm, "countryCode">;
  label: string;
  autoComplete: string;
  type: string;
  required: boolean;
  full?: boolean;
}[] = [
  { key: "fullName", label: "Full name", autoComplete: "shipping name", type: "text", required: true },
  { key: "phone", label: "Mobile number", autoComplete: "shipping tel", type: "tel", required: true },
  { key: "line1", label: "Street address", autoComplete: "shipping address-line1", type: "text", required: true, full: true },
  { key: "line2", label: "Apartment, floor, etc. (optional)", autoComplete: "shipping address-line2", type: "text", required: false, full: true },
  { key: "city", label: "City", autoComplete: "shipping address-level2", type: "text", required: true },
  { key: "state", label: "District (optional)", autoComplete: "shipping address-level1", type: "text", required: false },
  { key: "postalCode", label: "Postal code", autoComplete: "shipping postal-code", type: "text", required: true },
];

const BD_MOBILE = /^(?:\+?880|0)1[3-9]\d{8}$/;
const POSTAL = /^[0-9A-Za-z -]{3,10}$/;

function validateAddress(a: AddressForm): string {
  if (!a.fullName.trim()) return "Enter your full name.";
  if (!BD_MOBILE.test(a.phone.replace(/[\s()-]/g, "")))
    return "Enter a valid Bangladeshi mobile number, for example 01712345678.";
  if (!a.line1.trim()) return "Enter your street address.";
  if (!a.city.trim()) return "Enter your city.";
  if (!POSTAL.test(a.postalCode.trim())) return "Enter a valid postal code.";
  return "";
}

function clampQty(raw: string | null, max: number): number {
  const n = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(1, n)) : 1;
}

const inputClass =
  "min-h-12 w-full rounded-xl border border-border bg-bg px-3 text-base text-text outline-none focus:ring-2 focus:ring-[var(--focus)]";

function CheckoutContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const cart = useCart();

  const directSlug = sp.get("product") ?? "";
  const directQty = clampQty(sp.get("qty"), 100);
  const source: "direct" | "cart" = directSlug ? "direct" : "cart";

  const [hydrated, setHydrated] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [address, setAddress] = useState<AddressForm>(emptyAddress);
  const [step, setStep] = useState<"details" | "review">("details");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (step !== "details") heading.current?.focus();
  }, [step]);

  useEffect(() => {
    if (!hydrated) return;
    if (!isLoggedIn()) {
      const returnTo = window.location.pathname + window.location.search;
      router.replace(`/auth/login?next=${encodeURIComponent(returnTo)}`);
      return;
    }
    setSignedIn(true);
  }, [hydrated, router]);

  const cartKey = cart.lines.map((l) => `${l.slug}:${l.quantity}`).join("|");

  useEffect(() => {
    if (!hydrated || !signedIn) return;
    let active = true;

    const requests =
      source === "direct"
        ? [{ slug: directSlug, quantity: directQty }]
        : cart.lines.map((l) => ({ slug: l.slug, quantity: l.quantity }));

    if (requests.length === 0) {
      setItems([]);
      setLoadError("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError("");
    Promise.all(
      requests.map((r) =>
        productApi
          .get(r.slug)
          .then((product) => ({ product, quantity: r.quantity }) as CheckoutItem)
          .catch(() => null),
      ),
    )
      .then((results) => {
        if (!active) return;
        const ok = results.filter((r): r is CheckoutItem => r !== null);
        setItems(ok);
        if (ok.length !== results.length) {
          setLoadError("Some products could not be loaded. Remove them from your bag to continue.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, signedIn, source, directSlug, directQty, cartKey]);

  const currency = items[0]?.product.currency ?? "BDT";
  const subtotal = items.reduce((sum, i) => sum + i.product.effectivePriceCents * i.quantity, 0);
  const unavailable = items.filter((i) => !i.product.inStock);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const problem = validateAddress(address);
    if (problem) {
      setFormError(problem);
      return;
    }
    setFormError("");
    setStep("review");
  }

  async function placeOrder() {
    if (submitting) return;
    if (items.length === 0) {
      setFormError("Your bag is empty.");
      return;
    }
    if (unavailable.length > 0) {
      setFormError("Remove unavailable items before placing your order.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    let orderId: string;
    try {
      const order = await orderApi.create(
        items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        {
          fullName: address.fullName.trim(),
          phone: address.phone.trim(),
          line1: address.line1.trim(),
          line2: address.line2.trim() || null,
          city: address.city.trim(),
          state: address.state.trim() || null,
          postalCode: address.postalCode.trim(),
          countryCode: "BD",
        },
      );
      orderId = order.id;
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Your order could not be placed. Nothing has been charged.");
      setSubmitting(false);
      return;
    }

    if (source === "cart") cart.clear();

    try {
      const session = await orderApi.pay(orderId, "SSLCOMMERZ");
      if (session.redirectUrl) {
        window.location.assign(session.redirectUrl);
        return;
      }
    } catch {
      // The order exists. The order page lets the customer retry payment.
    }
    router.push(`/account/orders/${orderId}`);
  }

  if (!hydrated || !signedIn || loading) {
    return (
      <div role="status" className="h-80 animate-pulse rounded-2xl bg-surface">
        <span className="sr-only">Loading checkout</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-surface p-10 text-center">
        <h1 className="text-2xl font-semibold">Your bag is empty.</h1>
        <p className="mt-3 text-sm text-text-muted">Add something you love, then come back to checkout.</p>
        <Link href="/products" className={buttonClasses({ className: "mt-6" })}>
          Explore products
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link
        href={source === "cart" ? "/account/cart" : `/products/${directSlug}`}
        className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-text-muted"
      >
        <Icon name="arrowLeft" size={16} />
        {source === "cart" ? "Back to bag" : "Back to product"}
      </Link>

      <div className="mb-8">
        <p className="eyebrow mb-3 text-text-muted">Almost yours</p>
        <h1 ref={heading} tabIndex={-1} className="text-3xl font-semibold tracking-tight">
          {step === "review" ? "One last look." : "Where should we send it?"}
        </h1>
        <ol aria-label="Checkout progress" className="mt-5 flex gap-5 text-sm">
          <li aria-current={step === "details" ? "step" : undefined} className={step === "details" ? "font-semibold" : "text-text-muted"}>
            1. Delivery details
          </li>
          <li aria-hidden="true" className="text-text-muted">/</li>
          <li aria-current={step === "review" ? "step" : undefined} className={step === "review" ? "font-semibold" : "text-text-muted"}>
            2. Review
          </li>
        </ol>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-5 lg:gap-12">
        <section aria-label="Checkout details" className="lg:col-span-3">
          {loadError && (
            <p role="alert" className="mb-5 rounded-xl border border-danger bg-bg p-4 text-sm text-danger">
              {loadError}
            </p>
          )}
          {formError && (
            <p role="alert" className="mb-5 rounded-xl border border-danger bg-bg p-4 text-sm text-danger">
              {formError}
            </p>
          )}

          {step === "details" ? (
            <form onSubmit={review} className="space-y-5" noValidate>
              <h2 className="text-lg font-semibold">Delivery address</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {FIELDS.map((f) => (
                  <div key={f.key} className={f.full ? "sm:col-span-2" : ""}>
                    <label htmlFor={`address-${f.key}`} className="mb-2 block text-sm font-medium">
                      {f.label}
                    </label>
                    <input
                      id={`address-${f.key}`}
                      name={f.key}
                      type={f.type}
                      autoComplete={f.autoComplete}
                      required={f.required}
                      maxLength={f.key === "phone" ? 20 : f.key === "postalCode" ? 10 : 160}
                      value={address[f.key]}
                      onChange={(e) => setAddress((a) => ({ ...a, [f.key]: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <p className="text-sm text-text-muted">We currently deliver within Bangladesh.</p>
                </div>
              </div>
              <button type="submit" className={buttonClasses({ size: "lg", className: "w-full" })}>
                Review order <Icon name="arrowRight" size={17} />
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="rounded-xl border border-border p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="font-semibold">Delivering to</h2>
                  <button
                    onClick={() => {
                      setStep("details");
                      setFormError("");
                    }}
                    className="min-h-11 px-2 text-sm font-semibold underline underline-offset-4"
                  >
                    Edit details
                  </button>
                </div>
                <p className="text-sm leading-relaxed text-text-muted">
                  {address.fullName}
                  <br />
                  {address.line1}
                  {address.line2.trim() ? `, ${address.line2.trim()}` : ""}
                  <br />
                  {address.city}
                  {address.state.trim() ? `, ${address.state.trim()}` : ""}
                  {address.postalCode ? ` ${address.postalCode}` : ""}
                  <br />
                  Bangladesh
                  <br />
                  {address.phone}
                </p>
              </div>

              <div className="rounded-xl border border-border p-5 text-sm leading-relaxed text-text-muted">
                <p>Payment is completed on the next screen through our payment partner.</p>
                <p className="mt-2">
                  Delivery charges and the final total are confirmed by the seller before dispatch.
                </p>
              </div>

              <button
                onClick={placeOrder}
                disabled={submitting || unavailable.length > 0}
                className={buttonClasses({ size: "lg", className: "w-full" })}
              >
                {submitting ? "Placing order…" : "Place order"}
                <Icon name="check" size={18} />
              </button>
            </div>
          )}
        </section>

        <aside
          aria-label="Order summary"
          className="rounded-2xl border border-border bg-surface p-5 sm:p-6 lg:sticky lg:top-36 lg:col-span-2"
        >
          <h2 className="mb-5 text-lg font-semibold">Your order</h2>
          <ul className="flex flex-col gap-5">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex items-start gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-border">
                  {product.imageUrls[0] && (
                    <Image
                      src={product.imageUrls[0]}
                      alt=""
                      fill
                      sizes="64px"
                      unoptimized={!product.imageUrls[0].startsWith("/")}
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-text-muted">{product.store.storeName}</p>
                  <p className="text-sm font-semibold">{product.name}</p>
                  <p className="mt-1 text-xs text-text-muted">
                    Qty {quantity} · {formatMoney(product.effectivePriceCents, currency)} each
                  </p>
                  {!product.inStock && <p className="mt-1 text-xs text-red-600">Out of stock</p>}
                </div>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-text-muted">Items ({itemCount})</dt>
              <dd>{formatMoney(subtotal, currency)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-text-muted">Delivery</dt>
              <dd>To be confirmed</dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-border pt-4 font-semibold">
              <dt>Subtotal</dt>
              <dd className="text-lg">{formatMoney(subtotal, currency)}</dd>
            </div>
          </dl>

          {source === "cart" && (
            <Link href="/account/cart" className="mt-4 inline-flex min-h-11 items-center text-xs underline underline-offset-4">
              Edit bag
            </Link>
          )}

          <div className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-xs text-text-muted">
            <Icon name="shield" size={16} />
            Review before you pay
          </div>
        </aside>
      </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Nav />
      <main id="main-content" tabIndex={-1} className="page-width py-8 md:py-12">
        <Suspense fallback={<p role="status">Loading checkout…</p>}>
          <CheckoutContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}