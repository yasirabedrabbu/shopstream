// apps/web/src/components/Badge.tsx

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "accent"
  | "muted";

// Colour = semantic tokens only (app/globals.css). No raw zinc/emerald/amber/lime.
const styles: Record<BadgeVariant, string> = {
  default: "bg-surface text-text",
  success: "bg-tone-green-soft text-tone-green",
  warning: "bg-tone-amber-soft text-tone-amber",
  danger: "bg-tone-red-soft text-tone-red",
  accent: "bg-accent text-accent-text",
  muted: "bg-surface text-text-muted",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

// ─── Status mappers ───────────────────────────────────────────────────────────

export function orderStatusBadge(status: string) {
  const map: Record<string, BadgeVariant> = {
    PENDING: "warning",
    AWAITING_PAYMENT: "warning",
    PAID: "success",
    CANCELLED: "danger",
    EXPIRED: "muted",
  };
  return <Badge variant={map[status] ?? "default"}>{status}</Badge>;
}

export function vendorStatusBadge(status: string) {
  const map: Record<string, BadgeVariant> = {
    PENDING: "warning",
    APPROVED: "success",
    SUSPENDED: "danger",
    REJECTED: "danger",
  };
  return <Badge variant={map[status] ?? "default"}>{status}</Badge>;
}

export function productStatusBadge(status: string) {
  const map: Record<string, BadgeVariant> = {
    DRAFT: "muted",
    ACTIVE: "success",
    ARCHIVED: "default",
    BLOCKED: "danger",
  };
  return <Badge variant={map[status] ?? "default"}>{status}</Badge>;
}