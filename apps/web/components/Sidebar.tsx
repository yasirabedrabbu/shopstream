// apps/web/src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";

export interface SidebarLink {
  href: string;
  label: string;
  icon: IconName;
}

interface SidebarProps {
  links: SidebarLink[];
  title: string;
}

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar({ links, title }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      aria-label={`${title} navigation`}
      className="hidden md:flex flex-col w-56 shrink-0 border-r min-h-screen sticky top-0 self-start pt-6 px-3"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <p
        className="px-3 mb-3 text-xs font-semibold uppercase tracking-widest"
        style={{ color: "var(--text-muted)" }}
      >
        {title}
      </p>

      <nav className="flex flex-col gap-1">
        {links.map((l) => {
          const active = isActive(pathname, l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className="flex items-center gap-3 px-3 min-h-11 rounded-xl text-sm font-medium transition-colors duration-200 hover:bg-[var(--bg)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30"
              style={{
                background: active ? "var(--accent)" : undefined,
                color: active ? "var(--accent-text)" : "var(--text)",
                fontWeight: active ? 600 : 500,
              }}
            >
              <Icon name={l.icon} size={18} />
              {l.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

// ─── Bottom dock (mobile) ─────────────────────────────────────────────────────

export function BottomDock({ links }: { links: SidebarLink[] }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 inset-x-0 md:hidden border-t z-30 flex items-center justify-around px-2 h-16 pb-[env(safe-area-inset-bottom)]"
      style={{
        background: "color-mix(in srgb, var(--bg) 92%, transparent)",
        backdropFilter: "blur(16px)",
        borderColor: "var(--border)",
      }}
    >
      {links.map((l) => {
        const active = isActive(pathname, l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className="flex flex-col items-center justify-center gap-0.5 min-w-11 min-h-11 px-2 rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30"
            style={{ color: active ? "var(--text)" : "var(--text-muted)" }}
          >
            <span
              className="grid place-items-center h-7 w-12 rounded-full transition-colors duration-200"
              style={{
                background: active ? "var(--accent)" : "transparent",
                color: active ? "var(--accent-text)" : undefined,
              }}
            >
              <Icon name={l.icon} size={18} />
            </span>
            <span className="text-[10px] font-medium">{l.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}