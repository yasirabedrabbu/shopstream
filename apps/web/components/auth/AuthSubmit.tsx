import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { SubmitLoading } from "./states/SubmitLoading";
export interface AuthSubmitProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading: boolean;
  loadingLabel: string;
  children: ReactNode;
}
export function AuthSubmit({ loading, loadingLabel, children, ...props }: AuthSubmitProps) {
  return (
    <Button
      {...props}
      type={props.type ?? "submit"}
      variant="primary"
      size="lg"
      loading={loading}
      className="a-submit"
      aria-label={loading ? loadingLabel : typeof children === "string" ? children : undefined}
    >
      <SubmitLoading loading={loading} label={loadingLabel}>
        {children}
      </SubmitLoading>
    </Button>
  );
}
