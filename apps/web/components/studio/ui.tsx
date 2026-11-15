"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { FulfillmentStatus } from "@/lib/types";

export type Tone = "amber" | "blue" | "violet" | "green" | "red" | "stone";

const TONE: Record<Tone, string> = {
  amber: "bg-amber-50 text-amber-800 ring-amber-600/20",
  blue: "bg-sky-50 text-sky-800 ring-sky-600/20",
  violet: "bg-violet-50 text-violet-800 ring-violet-600/20",
  green: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  red: "bg-red-50 text-red-800 ring-red-600/20",
  stone: "bg-stone-100 text-stone-700 ring-stone-500/20",
};

const DOT: Record<Tone, string> = {
  amber: "bg-amber-500",
  blue: "bg-sky-500",
  violet: "bg-violet-500",
  green: "bg-emerald-500",
  red: "bg-red-500",
  stone: "bg-stone-400",
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

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <section className={`rounded-2xl border border-stone-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${className}`}>
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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-stone-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Button({
  variant = "dark",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "dark" | "light" | "accent" }) {
  const styles = {
    dark: "bg-stone-900 text-white hover:bg-stone-800",
    light: "border border-stone-200 bg-white text-stone-800 hover:border-stone-400",
    accent: "bg-orange-500 text-white hover:bg-orange-600",
  }[variant];
  return (
    <button
      {...props}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
    />
  );
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
    <div role="tablist" aria-label={label} className="inline-flex flex-wrap rounded-xl border border-stone-200 bg-white p-1">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.value)}
            className={`min-h-9 rounded-lg px-3.5 text-sm transition ${
              on ? "bg-stone-900 text-white" : "text-stone-500 hover:text-stone-900"
            }`}
          >
            {o.label}
            {o.count !== undefined && (
              <span className={`ml-1.5 tabular-nums ${on ? "text-white/70" : "text-stone-400"}`}>{o.count}</span>
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
      <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-stone-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-orange-300"
      />
    </label>
  );
}

// Dot-matrix sparkline (Merivo style). Each column is one value, filled from the bottom.
export function DotSpark({
  values,
  color = "#f97316",
  rows = 6,
  dot = 3.4,
  gap = 3,
}: {
  values: number[];
  color?: string;
  rows?: number;
  dot?: number;
  gap?: number;
}) {
  const max = Math.max(1, ...values);
  const step = dot + gap;
  const width = values.length * step;
  const height = rows * step;
  const cells: ReactNode[] = [];
  values.forEach((v, c) => {
    const level = Math.round((v / max) * rows);
    for (let r = 0; r < rows; r++) {
      const filled = r >= rows - level;
      cells.push(
        <circle
          key={`${c}-${r}`}
          cx={c * step + dot / 2}
          cy={r * step + dot / 2}
          r={dot / 2}
          fill={filled ? color : "#e7e5e4"}
        />,
      );
    }
  });
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none" aria-hidden="true">
      {cells}
    </svg>
  );
}

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
    <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-stone-200 text-xs font-semibold text-stone-700">
      {initials}
    </span>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-stone-100 ${className}`} />;
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