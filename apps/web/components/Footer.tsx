// apps/web/src/components/Footer.tsx
import Link from "next/link";
import { DEMO_MODE } from "@/lib/demo";
import { Icon } from "./ui/Icon";

const shopLinks = [
  { href: "/products", label: "All products" },
  { href: "/#how-it-works", label: "How it works" },
];

const accountLinks = [
  { href: "/auth/login", label: "Sign in" },
  { href: "/sell", label: "For sellers" },
];

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of service" },
  { href: "/refund", label: "Refund policy" },
];

const paymentMethods = ["SSLCOMMERZ", "COD"];

const linkClass =
  "inline-flex min-h-11 w-fit items-center rounded-md text-sm text-text-muted transition-colors hover:text-text";

const headingClass =
  "mb-1 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t pb-16 sm:pb-0"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="page-width grid gap-8 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="flex flex-col gap-3">
          <span
            className="text-base font-bold tracking-tight text-[var(--text)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            ShopStream
          </span>
          <p className="max-w-xs text-sm leading-relaxed text-[var(--text-muted)]">
            Good finds from great little stores. An independent spirit, an
            everyday kind of marketplace.
          </p>
          {DEMO_MODE && (
            <p className="mt-1 flex items-center gap-2 text-xs text-text-muted">
              <Icon name="info" size={14} />
              Frontend demo · No real purchases
            </p>
          )}
        </div>

        <nav aria-label="Shop" className="flex flex-col gap-2">
          <h2 className={headingClass}>Shop</h2>
          {shopLinks.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass}>
              {l.label}
            </Link>
          ))}
        </nav>

        <nav aria-label="Account" className="flex flex-col gap-2">
          <h2 className={headingClass}>Account</h2>
          {accountLinks.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass}>
              {l.label}
            </Link>
          ))}
        </nav>

        <nav aria-label="Company" className="flex flex-col gap-2">
          <h2 className={headingClass}>Company</h2>
          {companyLinks.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      <div
        className="page-width flex flex-col gap-4 border-t py-6 md:flex-row md:items-center md:justify-between"
        style={{ borderColor: "var(--border)" }}
      >
        <p className="text-xs text-[var(--text-muted)]">
          © {year} ShopStream. All rights reserved.
        </p>

        {DEMO_MODE ? (
          <p className="text-xs text-text-muted">
            Designed for discovery. Built around independent stores.
          </p>
        ) : (
          <ul aria-label="Payment methods" className="flex flex-wrap gap-2">
            {paymentMethods.map((m) => (
              <li
                key={m}
                className="rounded-md border px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[var(--text-muted)]"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--bg)",
                }}
              >
                {m}
              </li>
            ))}
          </ul>
        )}
      </div>
    </footer>
  );
}
