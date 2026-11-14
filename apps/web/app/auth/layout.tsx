import type { Metadata } from "next";
import { AuthenticationShell } from "@/components/layout/auth/AuthenticationShell";
import "../platform/platform.css";
import "./auth.css";
export const metadata: Metadata = {
  title: "Welcome to ShopStream",
  description:
    "Sign in, create an account, or explore ShopStream’s account recovery and email verification screens.",
};
export interface AuthLayoutProps {
  children: React.ReactNode;
}
export default function AuthLayout({ children }: AuthLayoutProps) {
  return <AuthenticationShell>{children}</AuthenticationShell>;
}
