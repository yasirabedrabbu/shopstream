// apps/web/src/components/Nav.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getUser, clearSession } from "@/lib/auth";
import type { UserResponse } from "@/lib/types";
import { Icon, type IconName } from "@/components/ui/Icon";
import { buttonClasses } from "@/components/ui/Button";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
];

interface MenuItem {
  href: string;
  label: string;
  icon: IconName;
}

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setUser(getUser());
  }, []);

  // Close the account menu on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;

    function onPointerDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  function logout() {
    clearSession();
    setMenuOpen(false);
    router.push("/auth/login");
  }

  const menuItems: MenuItem[] = [];
  if (user?.role === "VENDOR") {
    menuItems.push({ href: "/vendor/dashboard", label: "Vendor dashboard", icon: "store" });
  }
  if (user?.role === "ADMIN") {
    menuItems.push({ href: "/admin/dashboard", label: "Admin panel", icon: "shield" });
  }
  menuItems.push({ href: "/account/orders", label: "My orders", icon: "receipt" });

  const initial = user?.fullName?.charAt(0).toUpperCase() ?? "";

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <header
      className="sticky top-0 z-40 w-full border-b"
      style={{
        background: "color-mix(in srgb, var(--bg) 88%, transparent)",
        backdropFilter: "blur(16px)",
        borderColor: "var(--border)",
      }}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4"
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus)]"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-text"
            style={{ fontFamily: "var(--font-heading)" }}
            aria-hidden="true"
          >
            S
          </span>
          <span
            className="text-base font-bold tracking-tight text-text"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            ShopStream
          </span>
        </Link>

        {/* Desktop segmented links */}
        <div className="hidden items-center gap-1 rounded-full bg-surface p-1 md:flex">
          {links.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus)] ${
                  active ? "bg-accent text-accent-text shadow-sm" : "text-text-muted hover:text-text"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-controls="account-menu"
                aria-label={`Account menu for ${user.fullName}`}
                className="flex min-h-11 items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 text-sm font-medium text-text transition-colors hover:border-text/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus)]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-text">
                  {initial}
                </span>
                <span className="hidden max-w-[10rem] truncate sm:inline">{user.fullName}</span>
                <span
                  className={`text-text-muted transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
                >
                  <Icon name="chevron" size={14} />
                </span>
              </button>

              {menuOpen && (
                <div
                  id="account-menu"
                  role="menu"
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
                      onClick={() => setMenuOpen(false)}
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
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/login" className={buttonClasses({ variant: "primary", size: "sm" })}>
              Sign in
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile links row */}
      <div className="mx-auto flex max-w-7xl gap-2 px-4 pb-3 md:hidden" aria-label="Mobile">
        {links.map((l) => {
          const active = isActive(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 flex-1 items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus)] ${
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