"use client";
import { DEMO_MODE } from "@/lib/demo";
import { useVerification } from "@/lib/auth/verify-email/useVerification";
import { FormHeading } from "../FormHeading";
import { AuthState } from "../states/AuthState";
import { VerificationSuccess } from "./VerificationSuccess";
import { VerificationContent } from "./VerificationContent";
export interface VerifyEmailFormProps {
  id?: string;
}
export function VerifyEmailForm({ id }: VerifyEmailFormProps) {
  const model = useVerification();
  return (
    <div id={id} data-frame="auth/verify-email" data-auth-state={model.state}>
      <FormHeading
        title="Verify your email"
        subtitle={
          <>
            {DEMO_MODE ? "Try a preview code for " : "Enter the code for "}
            <strong className="p-text p-body">{model.email}</strong>
          </>
        }
        icon="mail"
      />
      <AuthState state={model.state} success={<VerificationSuccess destination={model.destination} />}>
        <VerificationContent model={model} />
      </AuthState>
    </div>
  );
}
