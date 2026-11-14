"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { AuthPreviewProvider } from "@/components/auth/AuthPreviewProvider";
import { BrandPanel } from "./BrandPanel";
import { FormPanel } from "./FormPanel";
export interface AuthenticationShellProps {
  children: ReactNode;
}
export function AuthenticationShell({ children }: AuthenticationShellProps) {
  return (
    <AuthPreviewProvider>
      <div className="platform auth-pages" data-theme="light">
        <Link href="#auth-main" className="p-link p-skip">
          Skip to authentication form
        </Link>
        <BrandPanel />
        <FormPanel>{children}</FormPanel>
      </div>
    </AuthPreviewProvider>
  );
}
