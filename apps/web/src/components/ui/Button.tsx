// apps/web/src/components/ui/Button.tsx
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap " +
  "transition-all duration-200 active:scale-[0.98] " +
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30 " +
  "disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-text shadow-sm hover:brightness-95 hover:shadow-md",
  secondary:
    "bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:border-accent",
  ghost: "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]",
  danger: "bg-red-500 text-white hover:bg-red-600",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export function buttonClasses({
  variant = "primary",
  size = "md",
  className = "",
}: ButtonStyleOptions = {}): string {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`.trim();
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonStyleOptions;

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...rest} />;
}

interface ButtonLinkProps extends ButtonStyleOptions {
  href: string;
  children: ReactNode;
}

export function ButtonLink({ href, variant, size, className, children }: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonClasses({ variant, size, className })}>
      {children}
    </Link>
  );
}