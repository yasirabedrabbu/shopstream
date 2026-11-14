"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useStoredUser, clearSession } from "@/lib/auth";
import { DEMO_CATEGORIES, DEMO_MODE } from "@/lib/demo";
import { Icon } from "@/components/ui/Icon";
import { buttonClasses } from "@/components/ui/Button";
import { DemoBanner } from "./DemoBanner";

const links = [
  { href: "/products", label: "Shop all" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/contact", label: "Help" },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState<"categories" | "account" | "mobile" | null>(
    null,
  );
  const user = useStoredUser();
  const wrap = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!wrap.current?.contains(event.target as Node)) setOpen(null);
    };
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(null);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, [open]);

  function toggle(value: typeof open, element: HTMLButtonElement) {
    trigger.current = element;
    setOpen(open === value ? null : value);
  }
  function logout() {
    clearSession();
    setOpen(null);
    router.push("/");
  }

  return (
    <header
      ref={wrap}
      className="sticky top-0 z-40 border-b border-border bg-bg/95 backdrop-blur-xl"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(null);
      }}
    >
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <DemoBanner />
      <nav
        aria-label="Main navigation"
        className="page-width flex h-[76px] items-center justify-between gap-3"
      >
        <Link
          href="/"
          aria-label="ShopStream home"
          className="flex shrink-0 items-center gap-2.5 rounded-lg"
        >
          <span
            className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-xl font-bold text-accent-text"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            S<span className="sr-only">hopStream</span>
          </span>
          <span className="hidden text-lg font-bold tracking-tight text-text min-[360px]:inline">
            ShopStream<span className="text-[#727b28]">.</span>
          </span>
        </Link>
        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname.startsWith(link.href) ? "page" : undefined}
              className={`inline-flex min-h-11 items-center rounded-lg px-4 text-sm ${pathname.startsWith(link.href) ? "font-semibold text-text" : "text-text-muted hover:text-text"}`}
            >
              {link.label}
            </Link>
          ))}
          <div className="relative">
            <button
              onClick={(e) => toggle("categories", e.currentTarget)}
              aria-expanded={open === "categories"}
              aria-controls="category-navigation"
              className="flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm text-text-muted"
            >
              Categories <Icon name="chevron" size={14} />
            </button>
            {open === "categories" && (
              <div
                id="category-navigation"
                className="absolute left-0 top-full mt-2 grid w-80 grid-cols-2 gap-1 rounded-2xl border border-border bg-bg p-2 shadow-lg"
              >
                {DEMO_CATEGORIES.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.slug}`}
                    onClick={() => setOpen(null)}
                    className="flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-surface"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-3">
          <Link
            href="/#for-sellers"
            className="hidden min-h-11 items-center px-2 text-sm text-text-muted hover:text-text sm:inline-flex"
          >
            For sellers
          </Link>
          {!DEMO_MODE && user ? (
            <div className="relative">
              <button
                aria-expanded={open === "account"}
                aria-controls="account-navigation"
                onClick={(e) => toggle("account", e.currentTarget)}
                className="flex min-h-11 items-center gap-2 rounded-xl border border-border px-3"
              >
                <Icon name="user" />
                <span className="hidden sm:inline">Account</span>
              </button>
              {open === "account" && (
                <div
                  id="account-navigation"
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-bg p-2 shadow-lg"
                >
                  <p className="truncate px-3 py-2 text-sm font-semibold">
                    {user.fullName}
                  </p>
                  <Link
                    href="/account/orders"
                    onClick={() => setOpen(null)}
                    className="flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-surface"
                  >
                    My orders
                  </Link>
                  {user.role !== "CUSTOMER" && (
                    <Link
                      href={`/${user.role === "ADMIN" ? "admin" : "vendor"}/dashboard`}
                      className="flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-surface"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="min-h-11 w-full rounded-xl px-3 text-left text-sm text-danger hover:bg-surface"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className={buttonClasses({
                variant: "secondary",
                size: "sm",
                className: "gap-2",
              })}
            >
              <Icon name="user" size={16} />
              <span>Sign in</span>
            </Link>
          )}
          <button
            aria-label={
              open === "mobile" ? "Close navigation" : "Open navigation"
            }
            aria-expanded={open === "mobile"}
            aria-controls="mobile-navigation"
            onClick={(e) => toggle("mobile", e.currentTarget)}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl hover:bg-surface lg:hidden"
          >
            <Icon name={open === "mobile" ? "close" : "menu"} size={21} />
          </button>
        </div>
      </nav>
      {open === "mobile" && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="max-h-[70dvh] overflow-y-auto border-t border-border p-4 lg:hidden"
        >
          <div className="grid gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(null)}
                className="flex min-h-11 items-center rounded-xl px-3 font-medium hover:bg-surface"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="eyebrow px-3 pb-2 pt-5 text-text-muted">
            Explore categories
          </p>
          <div className="grid grid-cols-2 gap-1">
            {DEMO_CATEGORIES.map((c) => (
              <Link
                key={c.id}
                onClick={() => setOpen(null)}
                href={`/products?category=${c.slug}`}
                className="flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-surface"
              >
                {c.name}
              </Link>
            ))}
          </div>
          <Link
            href="/#for-sellers"
            onClick={() => setOpen(null)}
            className="mt-3 flex min-h-11 items-center rounded-xl border-t border-border px-3 text-sm"
          >
            Explore selling{" "}
            <Icon name="arrowRight" size={16} className="ml-auto" />
          </Link>
        </nav>
      )}
    </header>
  );
}
