import type { RegistrationModel } from "@/lib/auth/register/useRegistration";
import { SuccessPanel } from "../states/SuccessPanel";
import { ContinueLink } from "../ContinueLink";
export interface RegistrationSuccessProps {
  model: RegistrationModel;
}
export function RegistrationSuccess({ model }: RegistrationSuccessProps) {
  return (
    <SuccessPanel
      title={model.demo ? "A good beginning" : "Your account is ready"}
      actions={
        <ContinueLink href={`${model.demo ? "/auth/verify-email" : "/auth/login"}${model.nextQuery}`}>
          {model.demo ? "Continue to verification preview" : "Continue to sign in"}
        </ContinueLink>
      }
    >
      {model.demo
        ? "Your details look good in this preview. No account was created. Next, try the six-digit email verification flow."
        : "Your buyer account was created. Phone and workspace preferences are not stored by the current API."}
    </SuccessPanel>
  );
}
