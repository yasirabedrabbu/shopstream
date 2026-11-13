// apps/web/src/components/Nav.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getUser, clearSession } from "@/lib/auth";
import type { UserResponse } from "@/lib/types";
import { Icon, type IconName } from "@/components/ui/Icon";

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

  return (
    <header
      className="sticky top-0 z-40 w-full border-b"
      style={{
        background: "color-mix(in srgb, var(--bg) 88%, transparent)",
        backdropFilter: "blur(16px)",
        borderColor: "var(--border)",
      }}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-text"
            style={{ fontFamily: "var(--font-heading)" }}
            aria-hidden="true"
          >
            S
          </span>
          <span
            className="text-base font-bold tracking-tight"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}
          >
            ShopStream
          </span>
        </Link>

        <div className="hidden items-center gap-1 rounded-full p-1 md:flex" style={{ background: "var(--surface)" }}>
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                  active ? "bg-accent text-accent-text shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text)]"
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
                className="flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm font-medium transition-colors hover:border-accent"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-text">
                  {initial}
                </span>
                <span className="hidden max-w-[10rem] truncate sm:inline">{user.fullName}</span>
                <span
                  className={`transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
                  style={{ color: "var(--text-muted)" }}
                >
                  <Icon name="chevron" size={14} />
                </span>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border p-1.5 shadow-[var(--shadow-card)]"
                  style={{ background: "var(--bg)", borderColor: "var(--border)" }}
                >
                  <div className="px-3 pb-2 pt-1.5">
                    <p className="truncate text-sm font-semibold text-[var(--text)]">{user.fullName}</p>
                    <p className="truncate text-xs text-[var(--text-muted)]">{user.email}</p>
                  </div>
                  <div className="my-1 h-px" style={{ background: "var(--border)" }} />

                  {menuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-[var(--text)] transition-colors hover:bg-[var(--surface)]"
                    >
                      <span className="text-[var(--text-muted)]">
                        <Icon name={item.icon} size={16} />
                      </span>
                      {item.label}
                    </Link>
                  ))}

                  <div className="my-1 h-px" style={{ background: "var(--border)" }} />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={logout}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-red-500 transition-colors hover:bg-[var(--surface)]"
                  >
                    <Icon name="logout" size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-text shadow-sm transition-all hover:shadow-md"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}