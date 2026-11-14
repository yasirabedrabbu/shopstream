import { DEMO_MODE } from "@/lib/demo";
import type { VerificationModel } from "@/lib/auth/verify-email/useVerification";
import { AuthForm } from "../AuthForm";
import { OtpGroup } from "./OtpGroup";
import { FormError } from "../states/FormError";
import { AuthSubmit } from "../AuthSubmit";
export interface VerificationFormBodyProps {
  model: VerificationModel;
}
export function VerificationFormBody({ model }: VerificationFormBodyProps) {
  return (
    <AuthForm className="a-form" onSubmit={model.verify}>
      <OtpGroup model={model} />
      <p id={`${model.id}-help`} className="p-text p-small p-tone-muted">
        {DEMO_MODE
          ? "Preview code: 123456. No email was sent. Never enter a real security code."
          : "Enter the six-digit code from your email. Verification delivery must be configured by your administrator."}
      </p>
      <FormError id={`${model.id}-error`} message={model.visibleError} />
      <AuthSubmit
        loading={model.state === "loading"}
        disabled={model.resending}
        loadingLabel="Verifying your email"
      >
        Verify
      </AuthSubmit>
    </AuthForm>
  );
}
