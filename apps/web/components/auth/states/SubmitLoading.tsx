import type { ReactNode } from "react";
export interface SubmitLoadingProps {
  loading: boolean;
  label: string;
  children: ReactNode;
}
export function SubmitLoading({ loading, label, children }: SubmitLoadingProps) {
  return loading ? <span className="p-sr-only">{label}</span> : children;
}
