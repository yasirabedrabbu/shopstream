// apps/web/src/components/Pager.tsx
"use client";

interface PagerProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pager({ page, totalPages, onChange }: PagerProps) {
  if (totalPages <= 1) return null;

  const btn =
    "h-10 px-4 rounded-xl border text-sm font-medium disabled:opacity-40 transition-colors min-h-[44px]";

  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 0}
        className={btn}
        style={{ borderColor: "var(--border)", color: "var(--text)" }}
      >
        ← Previous
      </button>
      <span className="text-sm" style={{ color: "var(--text-muted)" }}>
        Page {page + 1} of {totalPages}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages - 1}
        className={btn}
        style={{ borderColor: "var(--border)", color: "var(--text)" }}
      >
        Next →
      </button>
    </div>
  );
}