// apps/web/src/components/Nav.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser, clearSession } from "@/lib/auth";
import type { UserResponse } from "@/lib/types";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setUser(getUser());
  }, []);

  function logout() {
    clearSession();
    router.push("/auth/login");
  }

  return (
    <header
      className="sticky top-0 z-40 w-full border-b"
      style={{
        background: "var(--bg)",
        backdropFilter: "blur(16px)",
        borderColor: "var(--border)",
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="font-bold text-base tracking-tight shrink-0"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}
        >
          ShopStream
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  active ? "bg-[#E8F44A] text-zinc-900" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
                style={active ? {} : { color: "var(--text-muted)" }}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors hover:border-[#E8F44A]"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              >
                <span className="hidden sm:inline">{user.fullName}</span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  ▾
                </span>
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-44 rounded-xl border shadow-lg overflow-hidden z-50"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  {user.role === "VENDOR" && (
                    <Link
                      href="/vendor/dashboard"
                      className="block px-4 py-2.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      style={{ color: "var(--text)" }}
                      onClick={() => setMenuOpen(false)}
                    >
                      Vendor Dashboard
                    </Link>
                  )}
                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin/dashboard"
                      className="block px-4 py-2.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      style={{ color: "var(--text)" }}
                      onClick={() => setMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    href="/account/orders"
                    className="block px-4 py-2.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    style={{ color: "var(--text)" }}
                    onClick={() => setMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="px-4 py-1.5 rounded-full text-sm font-semibold bg-[#E8F44A] text-zinc-900"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}