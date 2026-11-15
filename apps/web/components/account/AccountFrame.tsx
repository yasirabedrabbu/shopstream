"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { RequireAuth } from "./RequireAuth";

const tabs = [
  { href: "/account/orders", label: "Orders" },
  { href: "/account/wishlist", label: "Favorites" },
  { href: "/account/cart", label: "Shopping bag" },
  { href: "/account/profile", label: "Profile" },
];

export function AccountFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <RequireAuth>
      <div className="min-h-screen bg-bg text-text">
        <Nav />
        <main id="main-content" tabIndex={-1} className="page-width pb-16 pt-8">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-text-muted">{subtitle}</p>}
          <nav aria-label="Account sections" className="mt-6 flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const active = pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm ${
                    active ? "border-text bg-text text-bg" : "border-border text-text-muted"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-8">{children}</div>
        </main>
        <Footer />
      </div>
    </RequireAuth>
  );
}