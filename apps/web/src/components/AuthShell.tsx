// apps/web/src/components/AuthShell.tsx
import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

const points = [
  "Products, orders and payments in one dashboard",
  "Separate access for customers, vendors and admins",
  "Built on a tenant-safe backend: each store sees only its own data",
];

function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-text"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        S
      </span>
      <span
        className={`text-base font-bold tracking-tight ${inverted ? "text-bg" : "text-text"}`}
        style={{ fontFamily: "var(--font-heading)" }}
      >
        ShopStream
      </span>
    </span>
  );
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-bg md:grid md:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-text p-12 md:flex">
        <Link
          href="/"
          className="w-fit rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus)]"
        >
          <Logo inverted />
        </Link>

        <div className="flex max-w-md flex-col gap-8">
          <h2
            className="text-4xl font-bold leading-tight text-bg"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Run your store with confidence.
          </h2>
          <ul className="flex flex-col gap-4">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm text-bg/80">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-accent-text">
                  <Icon name="check" size={14} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-bg/60">© ShopStream</p>
      </aside>

      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-10 inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus)] md:hidden"
          >
            <Logo />
          </Link>

          <h1
            className="text-3xl font-bold text-text"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {title}
          </h1>
          <p className="mt-2 text-sm text-text-muted">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <p className="mt-6 text-center text-sm text-text-muted">{footer}</p>
        </div>
      </main>
    </div>
  );
}