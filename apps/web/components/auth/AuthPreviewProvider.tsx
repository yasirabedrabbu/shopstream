"use client";
import { useState, type ReactNode } from "react";
import { authContext } from "@/lib/auth/context";
import type { AuthViewState, SignupRole } from "@/lib/auth-pages/model";
export interface AuthPreviewProviderProps {
  children: ReactNode;
}
export function AuthPreviewProvider({ children }: AuthPreviewProviderProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<SignupRole>("Buyer");
  const [preview, setPreviewState] = useState<AuthViewState>("default");
  const [revision, setRevision] = useState(0);
  function setPreview(state: AuthViewState) {
    setPreviewState(state);
    setRevision((value) => value + 1);
  }
  return (
    <authContext.Provider
      value={{
        email,
        setEmail,
        role,
        setRole,
        preview,
        revision,
        setPreview,
        resetPreview: () => setPreviewState("default"),
      }}
    >
      {children}
    </authContext.Provider>
  );
}
