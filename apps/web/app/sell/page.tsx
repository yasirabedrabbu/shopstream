import Image from "next/image";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Icon } from "@/components/ui/Icon";
import { buttonClasses } from "@/components/ui/Button";
import { DEMO_MODE } from "@/lib/demo";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "For independent sellers" };
export default function SellerPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Nav />
      <main
        id="main-content"
        tabIndex={-1}
        className="page-width py-12 md:py-20"
      >
        <section className="grid items-center gap-10 md:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow mb-5 text-text-muted">
              For the independent-minded
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              A little store.
              <br />A world of possibility.
            </h1>
            <p className="mt-6 text-base leading-relaxed text-text-muted">
              You bring the things worth discovering. ShopStream’s seller
              experience is designed to bring your products, inventory, and
              orders into one place.
            </p>
            <div className="mt-7 rounded-xl border border-border bg-surface p-5">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Icon name="info" size={17} />
                {DEMO_MODE
                  ? "You’re viewing a seller concept"
                  : "Getting started"}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                {DEMO_MODE
                  ? "Store registration and dashboards are not connected in this frontend demo. No business details are collected here. Browse a sample storefront to see how your collection could look."
                  : "Create a customer account to get started, then contact support about seller registration."}
              </p>
            </div>
            <Link
              href={DEMO_MODE ? "/stores/bengal-thread" : "/auth/register"}
              className={buttonClasses({ className: "mt-6" })}
            >
              {DEMO_MODE ? "Explore a sample store" : "Create an account"}
              <Icon name="arrowRight" size={17} />
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src="/images/hero-seller.webp"
              alt="A textile seller preparing fabric at his independent store"
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </section>
        <section className="mt-16 border-t border-border pt-12">
          <p className="eyebrow mb-3 text-text-muted">
            The intended seller journey
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            Less admin. More of what you love.
          </h2>
          <ol className="mt-8 grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Tell your story",
                body: "A storefront with room for your collection and the story behind it.",
                icon: "store" as const,
              },
              {
                title: "Keep things in order",
                body: "Product listings and inventory designed to work side by side.",
                icon: "box" as const,
              },
              {
                title: "See the bigger picture",
                body: "A dashboard concept for following orders and understanding sales.",
                icon: "dashboard" as const,
              },
            ].map((item, i) => (
              <li
                key={item.title}
                className="rounded-xl border border-border p-6"
              >
                <div className="mb-5 flex justify-between">
                  <Icon name={item.icon} size={23} />
                  <span className="text-xs text-text-muted">0{i + 1}</span>
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </section>
        <section className="mt-14 grid items-center gap-8 rounded-2xl bg-surface p-6 md:grid-cols-2 md:p-9">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
            <Image
              src="/images/seller-dashboard.webp"
              alt="Illustrative photograph of a laptop displaying analytics, not the actual ShopStream dashboard"
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="eyebrow mb-3 text-text-muted">
              Built around your day
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">
              Your business, in perspective.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-text-muted">
              The vision is simple: spend less time piecing information
              together, and more time building your store.
            </p>
            <p className="mt-3 text-xs text-text-muted">
              Illustrative photo. The seller dashboard is not live in this
              preview.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
