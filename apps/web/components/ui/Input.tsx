// apps/web/src/components/ui/Input.tsx
"use client";

import { useId, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helper?: string;
  error?: string;
}

export function Input({
  label,
  helper,
  error,
  id,
  className = "",
  ...rest
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  const describedBy = error ? errorId : helper ? helpId : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-text">
          {label}
          {rest.required && (
            <span aria-hidden="true" className="ml-0.5 text-danger">
              *
            </span>
          )}
        </label>
      )}

      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`h-12 w-full rounded-[var(--radius-control)] border bg-bg px-3.5 text-base text-text outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-text-muted focus:ring-2 disabled:opacity-50 disabled:pointer-events-none ${
          error
            ? "border-danger focus:border-danger focus:ring-danger/20"
            : "border-border focus:ring-[var(--focus)]"
        } ${className}`}
        {...rest}
      />

      {error ? (
        <p id={errorId} role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : helper ? (
        <p id={helpId} className="text-xs text-text-muted">
          {helper}
        </p>
      ) : null}
    </div>
  );
}
