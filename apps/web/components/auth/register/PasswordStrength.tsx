import { passwordStrength } from "@/lib/auth-pages/model";
export interface PasswordStrengthProps {
  password: string;
}
export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;
  const strength = passwordStrength(password);
  return (
    <div className="a-password-strength">
      <div aria-hidden="true" className="a-strength-bars">
        {[1, 2, 3, 4].map((level) => (
          <span key={level} data-filled={level <= strength} />
        ))}
      </div>
      <p className="p-text p-small p-tone-muted">
        {strength < 2
          ? "Keep going — use at least 8 characters."
          : strength < 3
            ? "Getting there — mix letters, numbers, or symbols."
            : strength === 3
              ? "Good password strength."
              : "Strong password."}
      </p>
    </div>
  );
}
