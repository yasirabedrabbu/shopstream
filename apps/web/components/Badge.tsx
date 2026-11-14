// apps/web/src/components/Badge.tsx

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "accent"
  | "muted";

const styles: Record<BadgeVariant, string> = {
  default:
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  success:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  warning:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  danger:
    "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  accent:
    "bg-[#E8F44A] text-zinc-900",
  muted:
    "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500",
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