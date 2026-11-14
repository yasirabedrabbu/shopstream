// apps/web/src/app/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, useReducedMotion } from "framer-motion";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Icon, type IconName } from "@/components/ui/Icon";
import { buttonClasses } from "@/components/ui/Button";
import { productApi } from "@/lib/api";
import type { PublicProductResponse } from "@/lib/types";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TRUST = ["Live stock", "SSLCOMMERZ and COD", "Bangla and English", "Seller dashboard"];

const CATEGORIES = [
  { label: "Fashion", image: "/images/cat-fashion.jpg" },
  { label: "Electronics", image: "/images/cat-electronics.jpg" },
  { label: "Grocery", image: "/images/cat-grocery.jpg" },
  { label: "Beauty", image: "/images/cat-beauty.jpg" },
  { label: "Home", image: "/images/cat-home.jpg" },
  { label: "Books", image: "/images/cat-books.jpg" },
];

const STEPS = [
  {
    title: "Open your store",
    body: "Create an account and set up your store. Add your business details once.",
    image: "/images/how-step-1-laptop.jpg",
  },
  {
    title: "List and manage",
    body: "Add products with stock. Every order lands in one queue you can update.",
    image: "/images/how-step-2-parcel.jpg",
  },
  {
    title: "Deliver and get paid",
    body: "Pack, ship and update the status. Follow revenue on your dashboard.",
    image: "/images/how-step-3-courier.webp",
  },
];

const FEATURES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "store",
    title: "Multi-vendor stores",
    body: "Every seller gets a store page, products and orders inside one marketplace.",
  },
  {
    icon: "box",
    title: "Live inventory",
    body: "Stock drops when an order is placed, so buyers never pay for an item that is gone.",
  },
  {
    icon: "shield",
    title: "Secure checkout",
    body: "Pay online through SSLCOMMERZ, or choose cash on delivery.",
  },
  {
    icon: "truck",
    title: "Order tracking",
    body: "Buyers and sellers see each order move from placed to delivered.",
  },
  {
    icon: "dashboard",
    title: "Seller dashboard",
    body: "Revenue, orders, top products and low stock alerts, for 7 days, 30 days or all time.",
  },
  {
    icon: "chat",
    title: "Help assistant",
    body: "Instant answers in Bangla or English, with a WhatsApp handoff when you need a person.",
  },
];

export default function HomePage() {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
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

  useGSAP(
    () => {
      if (reduce) return;

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from("[data-hero='copy'] > *", { y: 28, opacity: 0, duration: 0.8, stagger: 0.09 })
        .from("[data-hero='media']", { scale: 0.96, opacity: 0, duration: 1 }, "-=0.6");

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 32,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
    },
    { scope: rootRef, dependencies: [reduce] },
  );

  return (
    <div ref={rootRef} style={{ background: "var(--bg)" }} className="min-h-screen">
      <Nav />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 md:grid-cols-12 md:py-20">
            <div data-hero="copy" className="flex flex-col gap-6 md:col-span-6">
              <p className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                Multi-vendor marketplace for Bangladesh
              </p>
              <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold leading-[1.05] tracking-tight text-text md:text-6xl">
                Shop from every store.
                <span className="block text-text-muted">Sell from one dashboard.</span>
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-text-muted md:text-lg">
                ShopStream connects Bangladeshi sellers and buyers with live stock, SSLCOMMERZ and cash on
                delivery.
              </p>
              <p className="text-sm text-text-muted">বাংলাদেশের বিক্রেতা আর ক্রেতার জন্য, এক জায়গায়।</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/products" className={buttonClasses({ variant: "primary", size: "lg" })}>
                  Shop now
                </Link>
                <Link href="/auth/register" className={buttonClasses({ variant: "secondary", size: "lg" })}>
                  Start selling
                </Link>
              </div>
            </div>

            <div data-hero="media" className="relative md:col-span-6">
              <motion.div
                animate={reduce ? undefined : { y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-[var(--shadow-lift)] md:aspect-[4/4.4]"
              >
                <Image
                  src="/images/hero-shopper.jpg"
                  alt="A shopper browsing products on her phone by a window"
                  fill
                  priority
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </motion.div>

              <div className="absolute -bottom-4 left-4 flex items-center gap-3 rounded-2xl border border-border bg-bg/95 px-4 py-3 shadow-[var(--shadow-card)] backdrop-blur md:-left-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-text">
                  <Icon name="checkCircle" size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-text">Order placed</p>
                  <p className="text-xs text-text-muted">Stock reserved instantly</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section aria-label="Highlights" className="border-y" style={{ borderColor: "var(--border)" }}>
          <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 md:grid-cols-4">
            {TRUST.map((t) => (
              <li key={t} className="flex items-center gap-2 text-sm font-medium text-text">
                <span className="text-success">
                  <Icon name="check" size={16} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </section>

        {/* Categories */}
        <section className="mx-auto max-w-7xl px-4 py-20" data-reveal>
          <div className="mb-10 flex flex-col gap-2">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-text md:text-4xl">
              Shop by category
            </h2>
            <p className="text-text-muted">From everyday essentials to gifts, find it in one place.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {CATEGORIES.map((c) => (
              <Link
                key={c.label}
                href={`/products?q=${encodeURIComponent(c.label)}`}
                className="group relative aspect-square overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus)]"
              >
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 16vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" aria-hidden="true" />
                <span className="absolute bottom-3 left-3 right-3 text-sm font-semibold text-white">{c.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Latest products */}
        <section className="mx-auto max-w-7xl px-4 pb-20" data-reveal>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-text md:text-4xl">
                Latest products
              </h2>
              <p className="text-text-muted">New listings from sellers across the marketplace.</p>
            </div>
            <Link href="/products" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-text">
              See all
              <Icon name="arrowRight" size={16} />
            </Link>
          </div>

          {products === null ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-2xl" style={{ background: "var(--surface)" }} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="rounded-2xl border border-border p-8 text-center text-text-muted">
              No products yet. Sellers are adding stock soon.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-24 border-t py-20" style={{ borderColor: "var(--border)" }}>
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-12 flex max-w-2xl flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">How it works</p>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-text md:text-4xl">
                From first listing to first delivery
              </h2>
            </div>
            <ol className="grid gap-6 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <li key={s.title} data-reveal className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-4">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                    <Image src={s.image} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                  </div>
                  <div className="flex items-start gap-3 px-2 pb-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-text">
                      {i + 1}
                    </span>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-semibold text-text">{s.title}</h3>
                      <p className="text-sm leading-relaxed text-text-muted">{s.body}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-20" data-reveal>
          <div className="mb-12 flex max-w-2xl flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">Features</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-text md:text-4xl">
              Built for buyers and sellers
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {FEATURES.map((f) => (
              <article
                key={f.title}
                className="group flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-text">
                  <Icon name={f.icon} size={20} />
                </span>
                <h3 className="font-semibold text-text">{f.title}</h3>
                <p className="text-sm leading-relaxed text-text-muted">{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Seller CTA */}
        <section className="mx-auto max-w-7xl px-4 pb-24" data-reveal>
          <div className="grid overflow-hidden rounded-[2rem] border border-border bg-surface md:grid-cols-2">
            <div className="relative aspect-[4/3] md:aspect-auto">
              <Image
                src="/images/hero-seller.png"
                alt="A tailor in his shop folding a blue printed fabric"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center gap-6 p-8 md:p-14">
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-text md:text-4xl">
                Sell to buyers across Bangladesh
              </h2>
              <p className="text-text-muted">
                Open your store in a few minutes, list your products and run every order from one dashboard.
              </p>
              <div>
                <Link href="/auth/register" className={buttonClasses({ variant: "primary", size: "lg" })}>
                  Open your store
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}