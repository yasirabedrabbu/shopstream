// apps/web/src/components/ui/Input.tsx
"use client";

import { useId, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helper?: string;
  error?: string;
}

export function Input({ label, helper, error, id, className = "", ...rest }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  const describedBy = error ? errorId : helper ? helpId : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-[var(--text)]">
          {label}
        </label>
      )}

      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`h-11 w-full rounded-xl border bg-[var(--bg)] px-3.5 text-sm text-[var(--text)] outline-none transition-all duration-200 placeholder:text-[var(--text-muted)] focus:border-accent focus:ring-4 focus:ring-accent/25 ${
          error ? "border-red-500" : "border-[var(--border)]"
        } ${className}`}
        {...rest}
      />

      {error ? (
        <p id={errorId} className="text-xs text-red-500">
          {error}
        </p>
      ) : helper ? (
        <p id={helpId} className="text-xs text-[var(--text-muted)]">
          {helper}
        </p>
      ) : null}
    </div>
  );
}