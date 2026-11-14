"use client";
import { useRegistration } from "@/lib/auth/register/useRegistration";
import { FormHeading } from "../FormHeading";
import { AuthState } from "../states/AuthState";
import { RegistrationContent } from "./RegistrationContent";
import { RegistrationSuccess } from "./RegistrationSuccess";
export interface RegisterFormProps {
  id?: string;
}
export function RegisterForm({ id }: RegisterFormProps) {
  const model = useRegistration();
  return (
    <div id={id} data-frame="auth/register" data-auth-state={model.state}>
      <FormHeading
        title="Create your account"
        subtitle={"Find your favorites. Start your store. Make it yours."}
      />
      <AuthState state={model.state} success={<RegistrationSuccess model={model} />}>
        <RegistrationContent model={model} />
      </AuthState>
    </div>
  );
}
