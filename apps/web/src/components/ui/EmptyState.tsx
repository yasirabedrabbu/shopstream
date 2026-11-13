// apps/web/src/components/ui/EmptyState.tsx
import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

interface EmptyStateProps {
  icon?: IconName;
  illustration?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon = "box",
  illustration,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[var(--border)] px-6 py-14 text-center">
      {illustration ?? (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/20 text-[var(--text)]">
          <Icon name={icon} size={26} />
        </div>
      )}

      <div className="flex max-w-sm flex-col gap-1.5">
        <h3 className="text-base font-semibold text-[var(--text)]">{title}</h3>
        {description && <p className="text-sm text-[var(--text-muted)]">{description}</p>}
      </div>

      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}