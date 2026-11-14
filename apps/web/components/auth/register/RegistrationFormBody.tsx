import type { RegistrationModel } from "@/lib/auth/register/useRegistration";
import { AuthForm } from "../AuthForm";
import { RegistrationFields } from "./RegistrationFields";
import { RegistrationOptions } from "./RegistrationOptions";
import { FormError } from "../states/FormError";
import { AuthSubmit } from "../AuthSubmit";
export interface RegistrationFormBodyProps {
  model: RegistrationModel;
}
export function RegistrationFormBody({ model }: RegistrationFormBodyProps) {
  return (
    <AuthForm className="a-form a-register-form" onSubmit={model.submit}>
      <RegistrationFields model={model} />
      <RegistrationOptions model={model} />
      <FormError message={model.errorMessage} />
      <AuthSubmit loading={model.busy} loadingLabel="Creating your account">
        Create account
      </AuthSubmit>
    </AuthForm>
  );
}
