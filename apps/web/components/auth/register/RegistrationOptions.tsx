import { DEMO_MODE } from "@/lib/demo";
import type { RegistrationModel } from "@/lib/auth/register/useRegistration";
import { RoleCards } from "./RoleCards";
import { TermsCheckbox } from "./TermsCheckbox";
export interface RegistrationOptionsProps {
  model: RegistrationModel;
}
export function RegistrationOptions({ model }: RegistrationOptionsProps) {
  return (
    <>
      <RoleCards
        value={model.values.role}
        onChange={(value) => model.update("role", value)}
        disabled={model.busy}
      />
      {!DEMO_MODE && (
        <p className="p-text p-small p-tone-muted">
          Connected signup creates buyer accounts only. Phone and workspace choices are preview-only.
        </p>
      )}
      <TermsCheckbox
        checked={model.values.terms}
        onChange={(value) => model.update("terms", value)}
        error={model.errors.terms}
        disabled={model.busy}
      />
    </>
  );
}
