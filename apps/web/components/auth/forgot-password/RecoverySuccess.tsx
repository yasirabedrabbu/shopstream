import type { RecoveryModel } from "@/lib/auth/forgot-password/useRecovery";
import { SuccessPanel } from "../states/SuccessPanel";
import { ContinueLink } from "../ContinueLink";
export interface RecoverySuccessProps {
  model: RecoveryModel;
}
export function RecoverySuccess({ model }: RecoverySuccessProps) {
  return (
    <SuccessPanel
      title="Check your inbox"
      actions={<ContinueLink href="/auth/login">Back to login</ContinueLink>}
    >
      This is the reset-email confirmation preview for{" "}
      {model.values.email.trim() || model.context.email || "you@example.com"}. No reset link was generated or
      emailed. You can return and try another address.
    </SuccessPanel>
  );
}
