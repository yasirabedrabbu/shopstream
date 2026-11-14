import type { LoginModel } from "@/lib/auth/login/useLogin";
import { AuthField } from "../AuthField";
import { PasswordField } from "../PasswordField";
export interface LoginFieldsProps {
  model: LoginModel;
}
export function LoginFields({ model }: LoginFieldsProps) {
  return (
    <>
      <AuthField
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        required
        maxLength={254}
        disabled={model.busy}
        value={model.values.email}
        error={model.errors.email}
        onChange={(event) => model.update("email", event.target.value)}
      />
      <PasswordField
        name="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        required
        disabled={model.busy}
        value={model.values.password}
        error={model.errors.password}
        onChange={(event) => model.update("password", event.target.value)}
      />
    </>
  );
}
