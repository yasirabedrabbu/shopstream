"use client";
import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { useAuthPreview } from "@/lib/auth/context";
export interface AuthLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  children: ReactNode;
}
export function AuthLink({ href, children, className = "", onClick, ...props }: AuthLinkProps) {
  const state = useAuthPreview();
  return (
    <Link
      href={href}
      className={`p-link a-text-link ${className}`}
      {...props}
      onClick={(event) => {
        state.resetPreview();
        onClick?.(event);
      }}
    >
      {children}
    </Link>
  );
}
