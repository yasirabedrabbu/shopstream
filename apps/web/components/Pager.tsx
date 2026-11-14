// apps/web/src/components/Pager.tsx
"use client";

import { Icon } from "@/components/ui/Icon";

interface PagerProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pager({ page, totalPages, onChange }: PagerProps) {
  if (totalPages <= 1) return null;

  const btn =
    "inline-flex h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium text-text transition-colors hover:bg-surface disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus)]";

  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 0}
        className={btn}
        aria-label="Previous page"
      >
        <Icon name="arrowLeft" size={16} />
        Previous
      </button>

      <span className="text-sm text-text-muted" aria-live="polite">
        Page {page + 1} of {totalPages}
      </span>

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages - 1}
        className={btn}
        aria-label="Next page"
      >
        Next
        <Icon name="arrowRight" size={16} />
      </button>
    </nav>
  );
}