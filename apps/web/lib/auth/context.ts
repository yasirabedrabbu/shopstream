"use client";
import { createContext, useContext } from "react";
import type { AuthViewState, SignupRole } from "@/lib/auth-pages/model";
export interface AuthContextValue {
  email: string;
  setEmail: (email: string) => void;
  role: SignupRole;
  setRole: (role: SignupRole) => void;
  preview: AuthViewState;
  revision: number;
  setPreview: (state: AuthViewState) => void;
  resetPreview: () => void;
}
export const authContext = createContext<AuthContextValue | null>(null);
export function useAuthPreview() {
  const value = useContext(authContext);
  if (!value) throw Error("AuthPreviewProvider is required");
  return value;
}
