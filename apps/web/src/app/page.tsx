// apps/web/src/app/page.tsx
"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Icon, type IconName } from "@/components/ui/Icon";
import { buttonClasses } from "@/components/ui/Button";
import { productApi } from "@/lib/api";
import { SITE } from "@/lib/site";
import type { PublicProductResponse } from "@/lib/types";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const CATEGORIES = [
  { label: "Fashion", image: "/images/cat-fashion.jpg" },
  { label: "Electronics", image: "/images/cat-electronics.jpg" },
  { label: "Grocery", image: "/images/cat-grocery.jpg" },
  { label: "Beauty", image: "/images/cat-beauty.jpg" },
  { label: "Home", image: "/images/cat-home.jpg" },
  { label: "Books", image: "/images/cat-books.jpg" },
];

const VIEWS = {
  buyers: {
    label: "For buyers",
    title: "Browse many stores, pay once, track every order.",
    points: [
      "Search across every seller in one place",
      "See live stock before you check out",
      "Pay with SSLCOMMERZ or choose cash on delivery",
      "Follow each order from placed to delivered",
    ],
    image: "/images/hero-shopper.jpg",
    alt: "A shopper browsing products on her phone",
  },
  sellers: {
    label: "For sellers",
    title: "Run your store and every order from one dashboard.",
    points: [
      "Revenue, net after commission and units sold",
      "Daily sales chart with 7 day, 30 day and all time views",
      "Low stock alerts and top product list",
      "Update order status as you pack and ship",
    ],
    image: "/images/seller-dashboard.jpg",
    alt: "A seller reviewing store sales on a laptop",
  },
} as const;

type ViewKey = keyof typeof VIEWS;

const JOURNEY = [
  { title: "Order placed", body: "The buyer chooses items. Stock is reserved right away." },
  { title: "Payment confirmed", body: "SSLCOMMERZ confirms the payment, or the buyer chose cash on delivery." },
  { title: "Seller confirms", body: "The seller reviews the order and starts packing." },
  { title: "Shipped", body: "The seller updates the status when the parcel leaves the store." },
  { title: "Delivered", body: "The buyer receives the order and can see the final status." },
];

const TRUST: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "shield",
    title: "Secure sign in",
    body: "Passwords are stored as hashes. Sessions use short-lived access tokens with refresh.",
  },
  {
    icon: "box",
    title: "Seller data stays separate",
    body: "Each seller sees only their own products, orders and revenue.",
  },
  {
    icon: "chat",
    title: "Private help chats",
    body: "The help assistant removes phone numbers and emails before it stores a question, and deletes logs after 30 days.",
  },
];

const FAQS = [
  {
    q: "How do I create an account?",
    a: "Select Start selling or Sign in at the top right, then complete the form. Your account is ready right away.",
  },
  {
    q: "How do I pay?",
    a: "Choose SSLCOMMERZ for online payment, or cash on delivery where it is available for the seller.",
  },
  {
    q: "How do I track my order?",
    a: "Sign in and open My orders. Each order shows its current status.",
  },
  {
    q: "How do I open a store?",
    a: "Create an account, then open your store from the seller area. Your store goes live after a quick review.",
  },
  {
    q: "Can I talk to a person?",
    a: "Yes. Use the help assistant and select the WhatsApp option to reach our team.",
  },
];

export default function HomePage() {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewKey>("buyers");
  const [products, setProducts] = useState<PublicProductResponse[] | null>(null);

  useEffect(() => {
    let active = true;
    productApi
      .list({ page: 0, size: 8 })
      .then((data) => {
        if (active) setProducts(data.content);
      })
      .catch(() => {
        if (active) setProducts([]);
      });
    return () => {
      active = false;
    };
  }, []);

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  }

  useGSAP(
    () => {
      if (reduce) return;

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from("[data-hero='copy'] > *", { y: 24, opacity: 0, duration: 0.7, stagger: 0.08 })
        .from("[data-hero='media']", { y: 32, opacity: 0, duration: 0.9 }, "-=0.5");

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 28,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      });
    },
    { scope: rootRef, dependencies: [reduce] },
  );

  const current = VIEWS[view];

  return (
    <div ref={rootRef} style={{ background: "var(--bg)" }} className="min-h-screen">
      <Nav />

      <main>
        {/* 1. Hero */}
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-10 md:grid-cols-12 md:pb-20 md:pt-16">
          <div data-hero="copy" className="flex flex-col gap-7 md:col-span-6">
            <p className="w-fit rounded-full bg-surface px-3 py-1 text-xs font-medium text-text-muted ring-1 ring-border">
              Marketplace for Bangladesh
            </p>
            <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold leading-[1.08] tracking-tight text-text md:text-5xl lg:text-6xl">
              Everything you need, from stores you can trust.
            </h1>
            <p className="max-w-md text-base leading-relaxed text-text-muted">
              Shop from many sellers in one place, with live stock, SSLCOMMERZ payments and cash on delivery.
            </p>

            <form
              onSubmit={onSearch}
              role="search"
              className="flex h-14 items-center gap-2 rounded-2xl border border-border bg-surface py-2 pl-4 pr-2 focus-within:ring-4 focus-within:ring-[var(--focus)]"
            >
              <span className="text-text-muted">
                <Icon name="search" size={18} />
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, stores or categories"
                aria-label="Search products, stores or categories"
                className="h-full min-w-0 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
              />
              <button type="submit" className={buttonClasses({ variant: "primary", size: "md" })}>
                Search
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/products" className={buttonClasses({ variant: "secondary", size: "lg" })}>
                Shop now
              </Link>
              <Link href="/auth/register" className="inline-flex min-h-12 items-center gap-1.5 px-2 text-sm font-semibold text-text">
                Open your store
                <Icon name="arrowRight" size={15} />
              </Link>
            </div>

            <p className="text-sm text-text-muted">বাংলাদেশের বিক্রেতা আর ক্রেতার জন্য, এক জায়গায়।</p>
          </div>

          <div data-hero="media" className="grid grid-cols-2 gap-4 md:col-span-6">
            <div className="relative row-span-2 aspect-[3/4] overflow-hidden rounded-[2rem] md:aspect-auto md:h-full">
              <Image
                src="/images/hero-shopper.jpg"
                alt="A shopper browsing products on her phone by a window"
                fill
                priority
                sizes="(min-width: 768px) 30vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-[2rem]">
              <Image
                src="/images/og-image.jpg"
                alt="A busy Dhaka market at sunset"
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-[2rem]">
              <Image
                src="/images/hero-seller.png"
                alt="A tailor folding a blue printed fabric in his shop"
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* 2. Tabbed product preview */}
        <section className="mx-auto max-w-7xl px-4 pb-20" data-reveal>
          <div className="mb-8 flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">One platform</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-text md:text-4xl">
              Built for both sides of the order
            </h2>
          </div>

          <div role="tablist" aria-label="Choose a view" className="mb-8 inline-flex rounded-full bg-surface p-1 ring-1 ring-border">
            {(Object.keys(VIEWS) as ViewKey[]).map((key) => {
              const selected = view === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`panel-${key}`}
                  id={`tab-${key}`}
                  onClick={() => setView(key)}
                  className={`min-h-11 rounded-full px-5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus)] ${
                    selected ? "bg-accent text-accent-text" : "text-text-muted hover:text-text"
                  }`}
                >
                  {VIEWS[key].label}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              id={`panel-${view}`}
              role="tabpanel"
              aria-labelledby={`tab-${view}`}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="grid items-center gap-8 md:grid-cols-12"
            >
              <div className="flex flex-col gap-6 md:col-span-5">
                <h3 className="font-[family-name:var(--font-heading)] text-2xl font-semibold tracking-tight text-text">
                  {current.title}
                </h3>
                <ul className="flex flex-col gap-3">
                  {current.points.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-text-muted">
                      <span className="mt-0.5 text-success">
                        <Icon name="check" size={16} />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] ring-1 ring-border md:col-span-7">
                <Image src={current.image} alt={current.alt} fill sizes="(min-width: 768px) 60vw, 100vw" className="object-cover" />
              </div>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* 3. Categories */}
        <section className="mx-auto max-w-7xl px-4 pb-16" data-reveal>
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-text md:text-3xl">
              Shop by category
            </h2>
            <Link href="/products" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-text">
              All products
              <Icon name="arrowRight" size={15} />
            </Link>
          </div>
          <div className="-mx-4 flex gap-6 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-6 md:gap-4 md:overflow-visible md:px-0">
            {CATEGORIES.map((c) => (
              <Link
                key={c.label}
                href={`/products?q=${encodeURIComponent(c.label)}`}
                className="group flex w-24 shrink-0 flex-col items-center gap-3 rounded-2xl py-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus)] md:w-auto"
              >
                <span className="relative h-20 w-20 overflow-hidden rounded-full ring-1 ring-border transition-transform duration-300 group-hover:scale-105 md:h-28 md:w-28">
                  <Image src={c.image} alt="" fill sizes="112px" className="object-cover" />
                </span>
                <span className="text-sm font-medium text-text">{c.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. Latest products */}
        <section className="mx-auto max-w-7xl px-4 pb-20" data-reveal>
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-text md:text-3xl">
              Latest from sellers
            </h2>
            <Link href="/products" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-text">
              See all
              <Icon name="arrowRight" size={15} />
            </Link>
          </div>

          {products === null ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-[var(--radius-card)]" style={{ background: "var(--surface)" }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {products !== null && products.length < 4 && (
            <div className="mt-6 flex flex-col items-start justify-between gap-5 rounded-[2rem] bg-accent p-6 text-accent-text md:flex-row md:items-center md:p-8">
              <div className="flex flex-col gap-1">
                <p className="font-[family-name:var(--font-heading)] text-xl font-semibold">Have something to sell?</p>
                <p className="text-sm opacity-80">Open a store and list your first product in minutes.</p>
              </div>
              <Link href="/auth/register" className={buttonClasses({ variant: "secondary", size: "md" })}>
                Open your store
              </Link>
            </div>
          )}
        </section>

        {/* 5. Order journey */}
        <section id="how-it-works" className="scroll-mt-24 py-20" style={{ background: "var(--surface)" }}>
          <div className="mx-auto grid max-w-7xl gap-12 px-4 md:grid-cols-12">
            <div className="flex flex-col gap-4 md:sticky md:top-28 md:col-span-4 md:self-start">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">Order journey</p>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-text md:text-4xl">
                One order, followed from start to finish
              </h2>
              <p className="text-text-muted">Buyers and sellers see the same status at every step.</p>
            </div>

            <ol className="relative flex flex-col gap-8 md:col-span-7 md:col-start-6">
              {JOURNEY.map((step, i) => (
                <motion.li
                  key={step.title}
                  initial={reduce ? false : { opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.45, delay: i * 0.05 }}
                  className="relative flex gap-5 pl-0"
                >
                  <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent font-semibold text-accent-text">
                    {i + 1}
                  </span>
                  {i < JOURNEY.length - 1 && (
                    <span aria-hidden="true" className="absolute left-5 top-10 h-[calc(100%-1.5rem)] w-px bg-border" />
                  )}
                  <div className="flex flex-col gap-1 pb-2">
                    <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-text">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-text-muted">{step.body}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* 6. Seller band */}
        <section className="mx-auto max-w-7xl px-4 py-20" data-reveal>
          <div className="grid overflow-hidden rounded-[2rem] bg-text text-bg md:grid-cols-2">
            <div className="relative aspect-[4/3] md:aspect-auto">
              <Image
                src="/images/seller-onboarding.jpg"
                alt="A seamstress at her sewing machine checking an order on her phone"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center gap-6 p-8 md:p-14">
              <p className="text-xs font-semibold uppercase tracking-widest opacity-70">For sellers</p>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight md:text-4xl">
                Your shop, your customers, one dashboard
              </h2>
              <p className="opacity-80">
                Open your store, list products and manage every order. See what sold, what is running low and what to
                restock next.
              </p>
              <div>
                <Link href="/auth/register" className={buttonClasses({ variant: "primary", size: "lg" })}>
                  Open your store
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Trust */}
        <section className="mx-auto max-w-7xl px-4 pb-20" data-reveal>
          <div className="mb-10 max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">Security</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-text md:text-4xl">
              Built to keep account and customer data safe
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {TRUST.map((t) => (
              <article key={t.title} className="flex flex-col gap-4 rounded-3xl bg-surface p-6 ring-1 ring-border">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-text">
                  <Icon name={t.icon} size={20} />
                </span>
                <h3 className="font-semibold text-text">{t.title}</h3>
                <p className="text-sm leading-relaxed text-text-muted">{t.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* 8. FAQ */}
        <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-20 md:grid-cols-12" data-reveal>
          <div className="flex flex-col gap-3 md:col-span-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">FAQ</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-text">
              Common questions
            </h2>
            <p className="text-text-muted">Can not find your answer? Ask the help assistant or message us on WhatsApp.</p>
          </div>
          <div className="divide-y divide-border border-y border-border md:col-span-8">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-left font-semibold text-text marker:hidden focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus)]">
                  {f.q}
                  <span className="text-text-muted transition-transform duration-200 group-open:rotate-180">
                    <Icon name="chevron" size={16} />
                  </span>
                </summary>
                <p className="pt-2 text-sm leading-relaxed text-text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* 9. Contact */}
        <section className="mx-auto max-w-7xl px-4 pb-24" data-reveal>
          <div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-surface p-8 ring-1 ring-border md:flex-row md:items-center md:p-12">
            <div className="flex flex-col gap-2">
              <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-text md:text-3xl">
                Talk to a real person
              </h2>
              <p className="text-text-muted">Questions about an order, a product or opening a store? We reply on WhatsApp.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={SITE.supportWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses({ variant: "primary", size: "lg" })}
              >
                Chat on WhatsApp
              </a>
              <Link href="/contact" className={buttonClasses({ variant: "secondary", size: "lg" })}>
                Contact us
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}