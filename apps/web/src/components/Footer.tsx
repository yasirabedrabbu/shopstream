// apps/web/src/components/Footer.tsx
import Link from "next/link";

const shopLinks = [
  { href: "/products", label: "All products" },
  { href: "/account/orders", label: "My orders" },
];

const accountLinks = [
  { href: "/auth/login", label: "Sign in" },
  { href: "/auth/register", label: "Create account" },
];

const paymentMethods = ["SSLCOMMERZ", "COD"];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-16 border-t"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <span
            className="text-base font-bold tracking-tight text-[var(--text)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            ShopStream
          </span>
          <p className="max-w-xs text-sm leading-relaxed text-[var(--text-muted)]">
            Bangladeshi sellers er jonno ek jaygay online store, payment ar delivery.
          </p>
        </div>

        <nav aria-label="Shop" className="flex flex-col gap-2">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Shop
          </h2>
          {shopLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="w-fit rounded-md text-sm text-[var(--text)] transition-colors hover:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <nav aria-label="Account" className="flex flex-col gap-2">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Account
          </h2>
          {accountLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="w-fit rounded-md text-sm text-[var(--text)] transition-colors hover:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      <div
        className="mx-auto flex max-w-7xl flex-col gap-4 border-t px-4 py-6 md:flex-row md:items-center md:justify-between"
        style={{ borderColor: "var(--border)" }}
      >
        <p className="text-xs text-[var(--text-muted)]">
          © {year} ShopStream. Sob odhikar sorokkhito.
        </p>

        <ul aria-label="Payment methods" className="flex flex-wrap gap-2">
          {paymentMethods.map((m) => (
            <li
              key={m}
              className="rounded-md border px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[var(--text-muted)]"
              style={{ borderColor: "var(--border)", background: "var(--bg)" }}
            >
              {m}
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}