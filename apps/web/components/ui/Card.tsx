// apps/web/src/components/ui/Card.tsx
import type { HTMLAttributes } from "react";

export type CardVariant = "flat" | "elevated" | "bordered";

const variants: Record<CardVariant, string> = {
  flat: "bg-[var(--surface)]",
  elevated: "bg-[var(--bg)] shadow-[var(--shadow-card)] border border-[var(--border)]",
  bordered: "bg-[var(--bg)] border border-[var(--border)]",
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padded?: boolean;
}

export function Card({
  variant = "bordered",
  padded = true,
  className = "",
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={`rounded-2xl ${variants[variant]} ${padded ? "p-5 md:p-6" : ""} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}