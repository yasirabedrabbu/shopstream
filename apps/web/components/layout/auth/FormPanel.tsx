"use client";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAuthPreview } from "@/lib/auth/context";
import { TopBar } from "./TopBar";
import { Footer } from "./Footer";
import { ModeNote } from "./ModeNote";
export interface FormPanelProps {
  children: ReactNode;
}
export function FormPanel({ children }: FormPanelProps) {
  const state = useAuthPreview();
  const path = usePathname();
  return (
    <div className="a-form-side">
      <TopBar />
      <main id="auth-main" tabIndex={-1} className="a-form-main">
        <div key={`${path}-${state.revision}`} className="a-form-container">
          {children}
          <ModeNote />
        </div>
      </main>
      <Footer />
    </div>
  );
}
