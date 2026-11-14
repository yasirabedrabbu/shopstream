"use client";
import { useRecovery } from "@/lib/auth/forgot-password/useRecovery";
import { FormHeading } from "../FormHeading";
import { AuthState } from "../states/AuthState";
import { RecoveryContent } from "./RecoveryContent";
import { RecoverySuccess } from "./RecoverySuccess";
export interface ForgotPasswordFormProps {
  id?: string;
}
export function ForgotPasswordForm({ id }: ForgotPasswordFormProps) {
  const model = useRecovery();
  return (
    <div id={id} data-frame="auth/forgot-password" data-auth-state={model.state}>
      <FormHeading
        title="Reset your password"
        subtitle={"Enter your email and we'll send you a reset link"}
        icon="password"
      />
      <AuthState state={model.state} success={<RecoverySuccess model={model} />}>
        <RecoveryContent model={model} />
      </AuthState>
    </div>
  );
}
