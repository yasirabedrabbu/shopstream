import type { RegistrationModel } from "@/lib/auth/register/useRegistration";
import { RegistrationFormBody } from "./RegistrationFormBody";
import { AuthLink } from "../AuthLink";
export interface RegistrationContentProps {
  model: RegistrationModel;
}
export function RegistrationContent({ model }: RegistrationContentProps) {
  return (
    <>
      <RegistrationFormBody model={model} />
      <p className="p-text p-body p-tone-muted a-switch-copy">
        Already have an account? <AuthLink href={`/auth/login${model.nextQuery}`}>Sign in</AuthLink>
      </p>
    </>
  );
}
