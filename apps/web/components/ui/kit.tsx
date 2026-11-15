"use client";

// Shared dashboard UI kit (Ordexa / Merivo / NoviQ / Store Inventory language):
// white rounded cards on a stone canvas, ink primary buttons, orange accent,
// soft status pills, dot-matrix sparklines. Used by every dashboard (studio, platform, support).
// Colour = tokens only (see app/globals.css). Icons = Hugeicons via <Icon />.
import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { FulfillmentStatus } from "@/lib/types";
import { Icon, type IconName } from "./Icon";
import { buttonClasses } from "./Button";

/* ───────── Status pills ───────── */

export type Tone = "amber" | "blue" | "violet" | "green" | "red" | "stone";

const TONE: Record<Tone, string> = {
  amber: "bg-tone-amber-soft text-tone-amber ring-tone-amber/20",
  blue: "bg-tone-blue-soft text-tone-blue ring-tone-blue/20",
  violet: "bg-tone-violet-soft text-tone-violet ring-tone-violet/20",
  green: "bg-tone-green-soft text-tone-green ring-tone-green/20",
  red: "bg-tone-red-soft text-tone-red ring-tone-red/20",
  stone: "bg-tone-stone-soft text-tone-stone ring-tone-stone/20",
};

const DOT: Record<Tone, string> = {
  amber: "bg-tone-amber-dot",
  blue: "bg-tone-blue-dot",
  violet: "bg-tone-violet-dot",
  green: "bg-tone-green-dot",
  red: "bg-tone-red-dot",
  stone: "bg-tone-stone-dot",
};

export const FULFILL: Record<FulfillmentStatus, { label: string; tone: Tone }> = {
  NEW: { label: "Pending", tone: "amber" },
  PACKED: { label: "Packed", tone: "blue" },
  SHIPPED: { label: "Shipped", tone: "violet" },
  DELIVERED: { label: "Delivered", tone: "green" },
  CANCELLED: { label: "Cancelled", tone: "red" },
};

export const NEXT_STEP: Partial<Record<FulfillmentStatus, { to: FulfillmentStatus; label: string }>> = {
  NEW: { to: "PACKED", label: "Mark packed" },
  PACKED: { to: "SHIPPED", label: "Mark shipped" },
  SHIPPED: { to: "DELIVERED", label: "Mark delivered" },
};

export function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${TONE[tone]}`}>
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${DOT[tone]}`} />
      {children}
    </span>
  );
}

/* ───────── Layout ───────── */

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <section className={`rounded-2xl border border-border bg-card shadow-[var(--shadow-sm)] ${className}`}>
      {children}
    </section>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-text md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/** Stat card: icon chip + label + big number + trend. Pass `spark` for a dot-matrix chart on the right. */
export function StatCard({
  icon,
  label,
  value,
  trend,
  trendLabel,
  spark,
}: {
  icon: IconName;
  label: string;
  value: ReactNode;
  /** Percentage change, e.g. 4.02 or -7.1. Omit when the API has no real trend. */
  trend?: number;
  trendLabel?: string;
  spark?: ReactNode;
}) {
  const up = (trend ?? 0) >= 0;
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent-soft text-brand-strong">
          <Icon name={icon} size={18} />
        </span>
        <p className="text-sm font-medium text-text">{label}</p>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-3xl font-semibold tabular-nums tracking-tight text-text">{value}</p>
          {trend !== undefined && (
            <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
              <span className={`inline-flex items-center gap-0.5 font-semibold ${up ? "text-success" : "text-danger"}`}>
                <Icon name="arrowUp" size={12} className={up ? "" : "rotate-180"} />
                {up ? "+" : ""}
                {trend.toFixed(2)}%
              </span>
              {trendLabel}
            </p>
          )}
        </div>
        {spark && <div className="w-28 shrink-0">{spark}</div>}
      </div>
    </Card>
  );
}

/* ───────── Controls ───────── */

export function Button({
  variant = "dark",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "dark" | "light" | "accent" }) {
  const map = { dark: "primary", light: "secondary", accent: "accent" } as const;
  return <button type="button" {...props} className={buttonClasses({ variant: map[variant], size: "md", className })} />;
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; count?: number }[];
  onChange: (v: T) => void;
}) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex flex-wrap rounded-xl border border-border bg-card p-1">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.value)}
            className={`min-h-10 rounded-lg px-3.5 text-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus/30 ${
              on ? "bg-ink font-medium text-ink-text" : "text-text-muted hover:text-text"
            }`}
          >
            {o.label}
            {o.count !== undefined && (
              <span className={`ml-1.5 tabular-nums ${on ? "opacity-70" : "text-text-muted"}`}>{o.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function SearchBox({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="relative block w-full md:w-72">
      <span className="sr-only">{label}</span>
      <Icon name="search" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-sm text-text outline-none transition placeholder:text-text-muted focus:border-text focus:ring-4 focus:ring-focus/20"
      />
    </label>
  );
}

/* ───────── Data viz ───────── */

/** Dot-matrix sparkline (Merivo style). One column per value, filled from the bottom. */
export function DotSpark({
  values,
  rows = 6,
  dot = 3.4,
  gap = 3,
  filledClass = "fill-accent",
}: {
  values: number[];
  rows?: number;
  dot?: number;
  gap?: number;
  /** Tailwind fill class for lit dots, e.g. "fill-tone-blue-dot". */
  filledClass?: string;
}) {
  const max = Math.max(1, ...values);
  const step = dot + gap;
  const width = Math.max(1, values.length) * step;
  const height = rows * step;
  const cells: ReactNode[] = [];
  values.forEach((v, c) => {
    const level = Math.round((v / max) * rows);
    for (let r = 0; r < rows; r++) {
      const filled = r >= rows - level;
      cells.push(
        <circle key={`${c}-${r}`} cx={c * step + dot / 2} cy={r * step + dot / 2} r={dot / 2} className={filled ? filledClass : "fill-border"} />,
      );
    }
  });
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none" aria-hidden="true">
      {cells}
    </svg>
  );
}

/* ───────── Misc ───────── */

export function Avatar({ name }: { name: string }) {
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase() || "?";
  return (
    <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-brand-strong">
      {initials}
    </span>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-surface ${className}`} />;
}

export function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

export function timeAgo(iso: string): string {
  const m = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  if (m < 1440) return `${Math.floor(m / 60)} hr ago`;
  const d = Math.floor(m / 1440);
  return `${d} ${d === 1 ? "day" : "days"} ago`;
}

export function todayLabel(): string {
  return new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
