import type { ReactNode } from "react";
import { AuthIcon } from "./AuthIcon";
export interface FormHeadingProps {
  title: string;
  subtitle: ReactNode;
  icon?: "mail" | "password";
}
export function FormHeading({ title, subtitle, icon }: FormHeadingProps) {
  return (
    <div className="a-form-heading">
      {icon && (
        <span className="a-heading-icon">
          <AuthIcon name={icon} className="a-icon-heading" />
        </span>
      )}
      <h1 className="p-text p-title">{title}</h1>
      <p className="p-text p-body p-tone-muted">{subtitle}</p>
    </div>
  );
}
