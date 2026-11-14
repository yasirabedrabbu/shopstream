import type { ReactNode } from "react";
import { AuthIcon } from "../AuthIcon";
export interface SuccessPanelProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}
export function SuccessPanel({ title, children, actions }: SuccessPanelProps) {
  return (
    <div className="a-success" role="status">
      <span className="a-success-icon">
        <AuthIcon name="checkCircle" className="a-icon-xl" />
      </span>
      <h2 className="p-text p-heading">{title}</h2>
      <p className="p-text p-body p-tone-muted">{children}</p>
      <div className="a-success-actions">{actions}</div>
    </div>
  );
}
