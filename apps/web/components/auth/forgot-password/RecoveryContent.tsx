import type { RecoveryModel } from "@/lib/auth/forgot-password/useRecovery";
import { AuthForm } from "../AuthForm";
import { AuthField } from "../AuthField";
import { AuthSubmit } from "../AuthSubmit";
import { FormError } from "../states/FormError";
import { BackLink } from "../BackLink";
export interface RecoveryContentProps {
  model: RecoveryModel;
}
export function RecoveryContent({ model }: RecoveryContentProps) {
  return (
    <>
      <AuthForm className="a-form" onSubmit={model.submit}>
        <AuthField
          label="Email address"
          type="email"
          inputMode="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          maxLength={254}
          disabled={model.busy}
          value={model.values.email}
          error={model.errors.email}
          onChange={(event) => model.update("email", event.target.value)}
        />
        <FormError message={model.errorMessage} />
        <AuthSubmit loading={model.busy} loadingLabel="Preparing reset link">
          Send reset link
        </AuthSubmit>
      </AuthForm>
      <BackLink href="/auth/login">Back to login</BackLink>
    </>
  );
}
