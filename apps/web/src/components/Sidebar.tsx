// apps/web/src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarLink {
  href: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  links: SidebarLink[];
  title: string;
}

export function Sidebar({ links, title }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex flex-col w-56 shrink-0 border-r min-h-screen pt-6 px-3 gap-1"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <p
        className="px-3 mb-3 text-xs font-semibold uppercase tracking-widest"
        style={{ color: "var(--text-muted)" }}
      >
        {title}
      </p>
      {links.map((l) => {
        const active = pathname === l.href || pathname.startsWith(l.href + "/");
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              active
                ? "bg-[#E8F44A] text-zinc-900"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
            style={active ? {} : { color: "var(--text)" }}
          >
            <span>{l.icon}</span>
            {l.label}
          </Link>
        );
      })}
    </aside>
  );
}

// ─── Bottom dock (mobile) ─────────────────────────────────────────────────────

export function BottomDock({ links }: { links: SidebarLink[] }) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 md:hidden border-t z-30 flex items-center justify-around px-2 h-16"
      style={{
        background: "rgba(var(--bg-rgb, 255 255 255) / 0.9)",
        backdropFilter: "blur(16px)",
        borderColor: "var(--border)",
      }}
    >
      {links.map((l) => {
        const active = pathname === l.href || pathname.startsWith(l.href + "/");
        return (
          <Link
            key={l.href}
            href={l.href}
            className="flex flex-col items-center gap-0.5 min-w-[44px] min-h-[44px] justify-center"
          >
            <span className="text-xl">{l.icon}</span>
            <span
              className="text-[10px] font-medium"
              style={{ color: active ? "#E8F44A" : "var(--text-muted)" }}
            >
              {l.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}