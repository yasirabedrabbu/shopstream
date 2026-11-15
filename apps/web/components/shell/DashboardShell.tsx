"use client";

// ONE shell for every logged-in dashboard (seller studio, platform admin, support).
// Hierarchy is identical everywhere: brand -> nav -> user card (sidebar >= 1024px),
// bottom tab bar on mobile (max 5 items), top bar with theme + page actions.
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/kit";
import { ThemeToggle } from "./ThemeToggle";

export interface ShellNavItem {
  href: string;
  label: string;
  icon: IconName;
  /** Match only the exact path (use for the overview route). */
  exact?: boolean;
  badge?: number;
}

export interface DashboardShellProps {
  brand: { href: string; role: string };
  nav: ShellNavItem[];
  user: { name: string; caption: string } | null;
  footerLinks?: { href: string; label: string }[];
  onSignOut: () => void;
  topbarExtra?: ReactNode;
  children: ReactNode;
}

function isActive(pathname: string, item: ShellNavItem): boolean {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
}

export function DashboardShell({ brand, nav, user, footerLinks = [], onSignOut, topbarExtra, children }: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-canvas text-text">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <div className="flex min-h-dvh">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-card p-5 lg:flex">
          <Link href={brand.href} className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus/30">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-text">
              <Icon name="store" size={20} />
            </span>
            <span className="min-w-0">
              <span className="block text-base font-semibold leading-tight tracking-tight">ShopStream</span>
              <span className="block text-xs text-text-muted">{brand.role}</span>
            </span>
          </Link>

          <nav aria-label={`${brand.role} navigation`} className="mt-8 flex flex-col gap-1">
            {nav.map((item) => {
              const active = isActive(pathname, item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus/30 ${
                    active ? "bg-ink font-medium text-ink-text" : "text-text-muted hover:bg-surface hover:text-text"
                  }`}
                >
                  <Icon name={item.icon} size={18} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${active ? "bg-accent text-accent-text" : "bg-accent-soft text-brand-strong"}`}>
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-border p-4">
            <div className="flex items-center gap-3">
              <Avatar name={user?.name ?? brand.role} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user?.name ?? brand.role}</p>
                <p className="truncate text-xs text-text-muted">{user?.caption ?? "Signed in"}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
              {footerLinks.map((l) => (
                <Link key={l.href} href={l.href} className="text-text-muted underline underline-offset-4 hover:text-text">
                  {l.label}
                </Link>
              ))}
              <button type="button" onClick={onSignOut} className="inline-flex items-center gap-1 text-text-muted underline underline-offset-4 hover:text-text">
                <Icon name="logout" size={12} />
                Sign out
              </button>
            </div>
          </div>
        </aside>

        {/* Content column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-canvas/90 px-4 py-3 backdrop-blur md:px-8">
            <Link href={brand.href} className="flex items-center gap-2 lg:hidden">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-text">
                <Icon name="store" size={18} />
              </span>
              <span className="text-sm font-semibold">ShopStream</span>
            </Link>
            <p className="hidden text-sm text-text-muted lg:block">{brand.role}</p>
            <div className="flex items-center gap-2">
              {topbarExtra}
              <ThemeToggle />
              <button
                type="button"
                onClick={onSignOut}
                aria-label="Sign out"
                className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-card text-text-muted transition hover:text-text focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus/30 lg:hidden"
              >
                <Icon name="logout" size={18} />
              </button>
            </div>
          </header>

          <main id="main-content" tabIndex={-1} className="flex-1 px-4 py-6 pb-28 md:px-8 md:py-8 lg:pb-8">
            <div className="mx-auto max-w-7xl space-y-6">{children}</div>
          </main>
        </div>
      </div>

      {/* Bottom tab bar (mobile) */}
      <nav
        aria-label={`${brand.role} mobile navigation`}
        className="fixed inset-x-0 bottom-0 z-30 grid border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden"
        style={{ gridTemplateColumns: `repeat(${Math.min(nav.length, 5)}, minmax(0, 1fr))` }}
      >
        {nav.slice(0, 5).map((item) => {
          const active = isActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-focus/30 ${
                active ? "text-brand-strong" : "text-text-muted"
              }`}
            >
              <Icon name={item.icon} size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
