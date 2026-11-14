"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Icon } from "@/components/ui/Icon";
import { buttonClasses } from "@/components/ui/Button";
import { productApi, orderApi } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { DEMO_MODE } from "@/lib/demo";
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
const fields = [
  {
    field: "fullName",
    label: "Full name",
    autoComplete: "shipping name",
    type: "text",
    required: true,
  },
  {
    field: "phone",
    label: "Phone number",
    autoComplete: "shipping tel",
    type: "tel",
    required: true,
  },
  {
    field: "line1",
    label: "Street address",
    autoComplete: "shipping address-line1",
    type: "text",
    required: true,
  },
  {
    field: "line2",
    label: "Apartment, floor, etc. (optional)",
    autoComplete: "shipping address-line2",
    type: "text",
    required: false,
  },
  {
    field: "city",
    label: "City",
    autoComplete: "shipping address-level2",
    type: "text",
    required: true,
  },
  {
    field: "state",
    label: "District (optional)",
    autoComplete: "shipping address-level1",
    type: "text",
    required: false,
  },
  {
    field: "postalCode",
    label: "Postal code",
    autoComplete: "shipping postal-code",
    type: "text",
    required: true,
  },
] as const;

function CheckoutContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const slug = sp.get("product") ?? "";
  const qty = Math.min(
    100,
    Math.max(1, Number.parseInt(sp.get("qty") ?? "1", 10) || 1),
  );
  const [product, setProduct] = useState<PublicProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [address, setAddress] = useState<ShippingAddress>(emptyAddress);
  const [step, setStep] = useState<"details" | "review" | "done">("details");
  const [payment, setPayment] = useState("cod");
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (step !== "details") heading.current?.focus();
  }, [step]);
  useEffect(() => {
    let active = true;
    if (!DEMO_MODE && !isLoggedIn()) {
      router.replace(
        `/auth/login?next=${encodeURIComponent(`/checkout?product=${encodeURIComponent(slug)}&qty=${qty}`)}`,
      );
      return;
    }
    if (!slug) return;
    productApi
      .get(slug)
      .then((data) => {
        if (active) {
          setProduct(data);
          if (!data.inStock)
            setError(
              "This product is no longer available. Please choose another find.",
            );
        }
      })
      .catch(() => {
        if (active)
          setError(
            "We couldn’t load your product. Please return to the collection and try again.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug, qty, router]);

  function review(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStep("review");
  }
  async function confirm() {
    if (!product || submitting) return;
    setSubmitting(true);
    setError("");
    if (DEMO_MODE) {
      setStep("done");
      setAddress(emptyAddress);
      setSubmitting(false);
      return;
    }
    try {
      const order = await orderApi.create(
        [{ productId: product.id, quantity: qty }],
        {
          ...address,
          line2: address.line2 || null,
          state: address.state || null,
        },
      );
      router.push(`/account/orders/${order.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Your order could not be placed. Nothing has been charged. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }
  const subtotal = (product?.effectivePriceCents ?? 0) * qty;
  const delivery = DEMO_MODE ? 8000 : 0;
  const money = (value: number) =>
    formatMoney(value, product?.currency ?? "BDT");
  const inputClass =
    "min-h-12 w-full rounded-xl border border-border bg-bg px-3 text-base text-text outline-none focus:ring-2 focus:ring-[var(--focus)]";

  if (!slug)
    return (
      <div className="rounded-xl bg-surface p-10 text-center">
        <h1 className="text-2xl font-semibold">Start with a little find.</h1>
        <p className="mt-3 text-sm text-text-muted">
          Choose a product before continuing to checkout.
        </p>
        <Link href="/products" className={buttonClasses({ className: "mt-6" })}>
          Explore products
        </Link>
      </div>
    );
  if (loading)
    return (
      <div role="status" className="h-80 animate-pulse rounded-2xl bg-surface">
        <span className="sr-only">Loading checkout</span>
      </div>
    );
  if (!product || (!product.inStock && step !== "done"))
    return (
      <div role="alert" className="rounded-2xl bg-surface p-10 text-center">
        <h1 className="text-2xl font-semibold">
          Let’s find you something else.
        </h1>
        <p className="mt-3 text-sm text-text-muted">{error}</p>
        <Link href="/products" className={buttonClasses({ className: "mt-6" })}>
          Back to the collection
        </Link>
      </div>
    );
  if (step === "done")
    return (
      <section className="mx-auto max-w-xl py-12 text-center">
        <span className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-accent text-accent-text">
          <Icon name="check" size={28} />
        </span>
        <p className="eyebrow mb-3 text-text-muted">
          Just a preview. A real sense of ease.
        </p>
        <h1
          ref={heading}
          tabIndex={-1}
          className="text-3xl font-semibold tracking-tight"
        >
          You’ve tried the checkout.
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-text-muted">
          Your sample order for {qty} × {product.name} is complete. No real
          order was created, no payment was taken, and your address was not
          saved or sent.
        </p>
        <div className="mt-7 rounded-xl border border-border bg-surface p-5 text-left">
          <div className="flex justify-between gap-3 text-sm">
            <span>Sample order total</span>
            <span className="font-bold">{money(subtotal + delivery)}</span>
          </div>
          <p className="mt-2 text-xs text-text-muted">
            Includes the illustrative ৳80 delivery fee.
          </p>
        </div>
        <Link href="/products" className={buttonClasses({ className: "mt-8" })}>
          Keep exploring <Icon name="arrowRight" size={16} />
        </Link>
      </section>
    );

  return (
    <>
      <Link
        href={`/products/${product.slug}`}
        className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-text-muted"
      >
        <Icon name="arrowLeft" size={16} />
        Back to product
      </Link>
      <div className="mb-8">
        <p className="eyebrow mb-3 text-text-muted">
          {DEMO_MODE ? "A no-pressure practice run" : "Almost yours"}
        </p>
        <h1
          ref={heading}
          tabIndex={-1}
          className="text-3xl font-semibold tracking-tight"
        >
          {step === "review" ? "One last look." : "The final little details."}
        </h1>
        <ol aria-label="Checkout progress" className="mt-5 flex gap-5 text-sm">
          <li
            aria-current={step === "details" ? "step" : undefined}
            className={step === "details" ? "font-semibold" : "text-text-muted"}
          >
            1. Delivery details
          </li>
          <li aria-hidden="true" className="text-text-muted">
            /
          </li>
          <li
            aria-current={step === "review" ? "step" : undefined}
            className={step === "review" ? "font-semibold" : "text-text-muted"}
          >
            2. Review
          </li>
        </ol>
      </div>
      {DEMO_MODE && (
        <div className="mb-7 flex items-start gap-3 rounded-xl border border-border bg-surface p-4 text-sm">
          <Icon name="info" className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Demo checkout — no real purchase</p>
            <p className="mt-1 text-xs leading-relaxed text-text-muted">
              Use example details. Nothing is submitted, charged, or saved.
              Delivery prices and timings are illustrative.
            </p>
          </div>
        </div>
      )}
      <div className="grid items-start gap-8 lg:grid-cols-5 lg:gap-12">
        <section aria-label="Checkout details" className="lg:col-span-3">
          {error && (
            <p
              role="alert"
              className="mb-5 rounded-xl border border-danger bg-bg p-4 text-sm text-danger"
            >
              {error}
            </p>
          )}
          {step === "details" ? (
            <form onSubmit={review} className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Delivery address</h2>
                {DEMO_MODE && (
                  <button
                    type="button"
                    onClick={() =>
                      setAddress({
                        fullName: "Demo Shopper",
                        phone: "01700000000",
                        line1: "123 Example Road",
                        line2: "",
                        city: "Dhaka",
                        state: "Dhaka",
                        postalCode: "1207",
                        countryCode: "BD",
                      })
                    }
                    className="min-h-11 text-sm font-semibold underline underline-offset-4"
                  >
                    Use example details
                  </button>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {fields.map(
                  ({ field, label, autoComplete, type, required }) => (
                    <div
                      key={field}
                      className={
                        field === "line1" || field === "line2"
                          ? "sm:col-span-2"
                          : ""
                      }
                    >
                      <label
                        htmlFor={`address-${field}`}
                        className="mb-2 block text-sm font-medium"
                      >
                        {label}
                      </label>
                      <input
                        id={`address-${field}`}
                        name={field}
                        type={type}
                        autoComplete={autoComplete}
                        required={required}
                        maxLength={
                          field === "postalCode"
                            ? 10
                            : field === "phone"
                              ? 20
                              : 160
                        }
                        pattern={
                          field === "phone"
                            ? "[+0-9 ()-]{7,20}"
                            : field === "postalCode"
                              ? "[0-9A-Za-z -]{3,10}"
                              : required
                                ? ".*\\S.*"
                                : undefined
                        }
                        title={
                          field === "phone"
                            ? "Enter a phone number with 7 to 20 characters."
                            : field === "postalCode"
                              ? "Enter a postal code with 3 to 10 letters or numbers."
                              : undefined
                        }
                        value={address[field] ?? ""}
                        onChange={(e) =>
                          setAddress((a) => ({ ...a, [field]: e.target.value }))
                        }
                        className={inputClass}
                      />
                    </div>
                  ),
                )}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="country"
                    className="mb-2 block text-sm font-medium"
                  >
                    Country
                  </label>
                  <select
                    id="country"
                    name="countryCode"
                    autoComplete="shipping country"
                    value={address.countryCode}
                    onChange={(e) =>
                      setAddress((a) => ({ ...a, countryCode: e.target.value }))
                    }
                    className={inputClass}
                  >
                    <option value="BD">Bangladesh</option>
                  </select>
                  <p className="mt-2 text-xs text-text-muted">
                    This checkout preview supports delivery within Bangladesh.
                  </p>
                </div>
              </div>
              {DEMO_MODE && (
                <fieldset className="space-y-3 border-t border-border pt-6">
                  <legend className="text-lg font-semibold">
                    Payment preview
                  </legend>
                  {[
                    {
                      id: "cod",
                      title: "Cash on delivery",
                      desc: "Illustrative only. No parcel or payment is requested.",
                    },
                    {
                      id: "online",
                      title: "Online payment",
                      desc: "Preview selection only. No card details will be collected.",
                    },
                  ].map((option) => (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${payment === option.id ? "border-text bg-surface" : "border-border"}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={option.id}
                        checked={payment === option.id}
                        onChange={() => setPayment(option.id)}
                        className="mt-1 h-4 w-4 accent-[var(--text)]"
                      />
                      <span>
                        <span className="block text-sm font-semibold">
                          {option.title}
                        </span>
                        <span className="mt-1 block text-xs leading-relaxed text-text-muted">
                          {option.desc}
                        </span>
                      </span>
                    </label>
                  ))}
                </fieldset>
              )}
              <button
                type="submit"
                className={buttonClasses({ size: "lg", className: "w-full" })}
              >
                Review {DEMO_MODE ? "sample " : ""}order
                <Icon name="arrowRight" size={17} />
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
                      setError("");
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
                  {address.line2 ? `, ${address.line2}` : ""}
                  <br />
                  {address.city}, {address.postalCode}
                  <br />
                  Bangladesh
                  <br />
                  {address.phone}
                </p>
              </div>
              <div className="rounded-xl border border-border p-5">
                <h2 className="font-semibold">Payment & delivery</h2>
                <p className="mt-3 text-sm text-text-muted">
                  {DEMO_MODE
                    ? `${payment === "cod" ? "Cash on delivery" : "Online payment"} (simulated)`
                    : "Payment is completed after creating the order."}
                </p>
                <p className="mt-2 text-sm text-text-muted">
                  {DEMO_MODE
                    ? "Sample delivery estimate: 3–5 working days."
                    : "Delivery timing and any charges require seller confirmation."}
                </p>
              </div>
              <p className="text-xs leading-relaxed text-text-muted">
                {DEMO_MODE
                  ? "Confirming finishes this demo only. No information leaves this page."
                  : "Review your details and the refund policy before placing your order. No payment is taken at this step."}
              </p>
              <button
                onClick={confirm}
                disabled={submitting}
                className={buttonClasses({ size: "lg", className: "w-full" })}
              >
                {submitting
                  ? "Placing order…"
                  : DEMO_MODE
                    ? "Finish demo checkout"
                    : "Place order"}
                <Icon name="check" size={18} />
              </button>
            </div>
          )}
        </section>
        <aside
          aria-label="Order summary"
          className="rounded-2xl border border-border bg-surface p-5 sm:p-6 lg:sticky lg:top-36 lg:col-span-2"
        >
          <h2 className="mb-5 text-lg font-semibold">Your little find</h2>
          <div className="flex items-start gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-border">
              {product.imageUrls[0] && (
                <Image
                  src={product.imageUrls[0]}
                  alt={product.name}
                  fill
                  sizes="80px"
                  unoptimized={!product.imageUrls[0].startsWith("/")}
                  className="object-cover"
                />
              )}
            </div>
            <div>
              <p className="text-xs text-text-muted">
                {product.store.storeName}
              </p>
              <p className="mt-1 text-sm font-semibold">{product.name}</p>
              <p className="mt-2 text-xs text-text-muted">
                Qty {qty} · {money(product.effectivePriceCents)} each
              </p>
              <Link
                href={`/products/${product.slug}`}
                className="inline-flex min-h-9 items-center text-xs underline underline-offset-4"
              >
                Edit quantity
              </Link>
            </div>
          </div>
          <dl className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-text-muted">Subtotal</dt>
              <dd>{money(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-text-muted">
                {DEMO_MODE ? "Sample delivery" : "Delivery"}
              </dt>
              <dd>{DEMO_MODE ? money(delivery) : "To be confirmed"}</dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-border pt-4 font-semibold">
              <dt>{DEMO_MODE ? "Sample total" : "Item total"}</dt>
              <dd className="text-lg">{money(subtotal + delivery)}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs leading-relaxed text-text-muted">
            {DEMO_MODE
              ? "All amounts shown are illustrative, including delivery. No taxes or fees will actually be charged."
              : "Includes the displayed product price. Any additional delivery charges require confirmation before payment."}
          </p>
          <div className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-xs text-text-muted">
            <Icon name="shield" size={16} />
            {DEMO_MODE
              ? "No payment information needed"
              : "Review before you pay"}
          </div>
        </aside>
      </div>
    </>
  );
}

function KeyedCheckoutContent() {
  const params = useSearchParams();
  return <CheckoutContent key={params.toString()} />;
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Nav />
      <main
        id="main-content"
        tabIndex={-1}
        className="page-width py-8 md:py-12"
      >
        <Suspense fallback={<p role="status">Loading checkout…</p>}>
          <KeyedCheckoutContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
