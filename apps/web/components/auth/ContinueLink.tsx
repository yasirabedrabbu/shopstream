import type { ReactNode } from "react";
import { AuthLink } from "./AuthLink";
import { AuthIcon } from "./AuthIcon";
export interface ContinueLinkProps {
  href: string;
  children: ReactNode;
}
export function ContinueLink({ href, children }: ContinueLinkProps) {
  return (
    <AuthLink href={href} className="a-button-link">
      {children}
      <AuthIcon name="arrowRight" className="a-icon-xs" />
    </AuthLink>
  );
}
