// apps/web/src/components/Nav.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getUser, clearSession } from "@/lib/auth";
import { categoryApi } from "@/lib/api";
import type { CategoryResponse, UserResponse } from "@/lib/types";
import { Icon, type IconName } from "@/components/ui/Icon";
import { buttonClasses } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "/products", label: "Shop" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/contact", label: "Help" },
];

type OpenMenu = "categories" | "account" | null;

interface MenuItem {
  href: string;
  label: string;
  icon: IconName;
}

function LogoMark() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" className="h-8 w-8 shrink-0">
      <rect width="48" height="48" rx="14" fill="#111114" />
      <path
        d="M33.5 16.2C31.9 14 29.2 12.7 25.2 12.7c-5 0-8.2 2.4-8.2 5.9 0 8.6 17.6 4.3 17.6 13 0 3.7-3.6 6.2-9.1 6.2-4.6 0-7.5-1.4-9.3-4.1"
        fill="none"
        stroke="#E8F44A"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [open, setOpen] = useState<OpenMenu>(null);

  useEffect(() => {
    setUser(getUser());
    let active = true;
    categoryApi
      .list()
      .then((data) => {
        if (active) setCategories(data);
      })
      .catch(() => {
        if (active) setCategories([]);
      });
    return () => {
      active = false;
    };
  }, []);

  // Close the open dropdown on outside click or Escape.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(null);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(null);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function logout() {
    clearSession();
    setUser(null);
    setOpen(null);
    router.push("/auth/login");
  }

  const menuItems: MenuItem[] = [];
  if (user?.role === "VENDOR") {
    menuItems.push({ href: "/vendor/dashboard", label: "Seller dashboard", icon: "store" });
  }
  if (user?.role === "ADMIN") {
    menuItems.push({ href: "/admin/dashboard", label: "Admin panel", icon: "shield" });
  }
  menuItems.push({ href: "/account/orders", label: "My orders", icon: "receipt" });

  const initial = user?.fullName?.charAt(0).toUpperCase() ?? "";

  function isActive(href: string) {
    const path = href.split("#")[0];
    return path === "/" ? pathname === "/" : pathname.startsWith(path);
  }

  return (
    <header
      ref={wrapRef}
      className="sticky top-0 z-40 w-full border-b"
      style={{
        background: "color-mix(in srgb, var(--bg) 85%, transparent)",
        backdropFilter: "blur(18px)",
        borderColor: "var(--border)",
      }}
    >
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus)]"
        >
          <LogoMark />
          <span className="text-base font-bold tracking-tight text-text" style={{ fontFamily: "var(--font-heading)" }}>
            ShopStream
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {categories.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen((v) => (v === "categories" ? null : "categories"))}
                aria-expanded={open === "categories"}
                aria-haspopup="menu"
                aria-controls="categories-menu"
                className={`flex min-h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus)] ${
                  open === "categories" ? "bg-surface text-text" : "text-text-muted hover:text-text"
                }`}
              >
                Categories
                <span className={`transition-transform duration-200 ${open === "categories" ? "rotate-180" : ""}`}>
                  <Icon name="chevron" size={14} />
                </span>
              </button>

              <AnimatePresence>
                {open === "categories" && (
                  <motion.div
                    id="categories-menu"
                    role="menu"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="absolute left-0 z-50 mt-2 grid w-[22rem] grid-cols-2 gap-1 rounded-2xl border border-border bg-bg p-2 shadow-[var(--shadow-lift)]"
                  >
                    {categories.map((c) => (
                      <Link
                        key={c.id}
                        href={`/products?category=${c.slug}`}
                        role="menuitem"
                        onClick={() => setOpen(null)}
                        className="flex min-h-11 items-center rounded-xl px-3 text-sm text-text transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus)]"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {NAV_LINKS.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-10 items-center rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus)] ${
                  active ? "text-text" : "text-text-muted hover:text-text"
                }`}
              >
                {l.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-accent"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen((v) => (v === "account" ? null : "account"))}
                aria-expanded={open === "account"}
                aria-haspopup="menu"
                aria-controls="account-menu"
                aria-label={`Account menu for ${user.fullName}`}
                className="flex min-h-11 items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 text-sm font-medium text-text transition-colors hover:border-text/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus)]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-text">
                  {initial}
                </span>
                <span className="hidden max-w-[10rem] truncate sm:inline">{user.fullName}</span>
                <span className={`text-text-muted transition-transform duration-200 ${open === "account" ? "rotate-180" : ""}`}>
                  <Icon name="chevron" size={14} />
                </span>
              </button>

              <AnimatePresence>
                {open === "account" && (
                  <motion.div
                    id="account-menu"
                    role="menu"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-border bg-bg p-1.5 shadow-[var(--shadow-lift)]"
                  >
                    <div className="px-3 pb-2 pt-1.5">
                      <p className="truncate text-sm font-semibold text-text">{user.fullName}</p>
                      <p className="truncate text-xs text-text-muted">{user.email}</p>
                    </div>
                    <div className="my-1 h-px bg-border" />

                    {menuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        onClick={() => setOpen(null)}
                        className="flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm text-text transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus)]"
                      >
                        <span className="text-text-muted">
                          <Icon name={item.icon} size={16} />
                        </span>
                        {item.label}
                      </Link>
                    ))}

                    <div className="my-1 h-px bg-border" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={logout}
                      className="flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 text-left text-sm text-danger transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus)]"
                    >
                      <Icon name="logout" size={16} />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hidden min-h-10 items-center rounded-full px-4 text-sm font-medium text-text-muted transition-colors hover:text-text sm:inline-flex"
              >
                Sign in
              </Link>
              <Link href="/auth/register" className={buttonClasses({ variant: "primary", size: "sm" })}>
                Start selling
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile row */}
      <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3 md:hidden" aria-label="Mobile">
        {NAV_LINKS.map((l) => {
          const active = isActive(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus)] ${
                active ? "bg-accent text-accent-text" : "bg-surface text-text-muted"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}