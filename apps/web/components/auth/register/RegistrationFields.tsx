import type { RegistrationModel } from "@/lib/auth/register/useRegistration";
import { AuthField } from "../AuthField";
import { PasswordField } from "../PasswordField";
import { PasswordStrength } from "./PasswordStrength";
export interface RegistrationFieldsProps {
  model: RegistrationModel;
}
export function RegistrationFields({ model }: RegistrationFieldsProps) {
  return (
    <div className="a-register-fields">
      <AuthField
        label="Full name"
        name="fullName"
        autoComplete="name"
        placeholder="Your full name"
        required
        maxLength={80}
        disabled={model.busy}
        value={model.values.name}
        error={model.errors.name}
        onChange={(event) => model.update("name", event.target.value)}
      />
      <AuthField
        label="Email address"
        type="email"
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
      <AuthField
        label="Phone number"
        type="tel"
        inputMode="tel"
        name="phone"
        autoComplete="tel-national"
        placeholder="017XXXXXXXX"
        maxLength={11}
        required
        disabled={model.busy}
        value={model.values.phone}
        error={model.errors.phone}
        onChange={(event) => model.update("phone", event.target.value)}
      />
      <PasswordField
        name="password"
        autoComplete="new-password"
        placeholder="Create a strong password"
        required
        disabled={model.busy}
        value={model.values.password}
        error={model.errors.password}
        onChange={(event) => model.update("password", event.target.value)}
      />
      <PasswordStrength password={model.values.password} />
    </div>
  );
}
