import type { ReactNode } from "react";
import { AuthLink } from "./AuthLink";
import { AuthIcon } from "./AuthIcon";
export interface BackLinkProps {
  href: string;
  children: ReactNode;
}
export function BackLink({ href, children }: BackLinkProps) {
  return (
    <AuthLink href={href} className="a-back-link">
      <AuthIcon name="arrowLeft" className="a-icon-xs" />
      {children}
    </AuthLink>
  );
}
