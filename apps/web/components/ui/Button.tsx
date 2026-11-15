import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

// primary   = ink (black). The ONE main action in a section.
// accent    = brand orange. Commerce moments (Add to bag, Buy now, New product).
// secondary = outlined card. ghost = text only. danger = destructive.
export type ButtonVariant = "primary" | "accent" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] font-semibold whitespace-nowrap select-none " +
  "transition-[background-color,border-color,box-shadow,transform,opacity] duration-200 active:scale-[0.98] " +
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus/30 " +
  "disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-ink-text hover:opacity-90",
  accent: "bg-accent text-accent-text hover:bg-accent-hover",
  secondary: "bg-card text-text border border-border hover:border-text/40",
  ghost: "text-text-muted hover:text-text hover:bg-surface",
  danger: "bg-danger text-white hover:brightness-95",
};

// every size is >= 44px tall (touch target minimum)
const sizes: Record<ButtonSize, string> = {
  sm: "min-h-11 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
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

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonStyleOptions & {
    loading?: boolean;
  };

export function Button({
  variant,
  size,
  className,
  type = "button",
  loading = false,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={buttonClasses({ variant, size, className })}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
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
