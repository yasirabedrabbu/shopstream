import type { ReactNode } from "react";
import type { AuthViewState } from "@/lib/auth-pages/model";
import { AuthEmpty } from "./AuthEmpty";
export interface AuthStateProps {
  state: AuthViewState;
  children: ReactNode;
  success: ReactNode;
}
export function AuthState({ state, children, success }: AuthStateProps) {
  const views = {
    default: children,
    loading: children,
    error: children,
    success,
  };
  return views[state] ?? <AuthEmpty />;
}
