export type SignupRole = "Buyer" | "Seller" | "Business";
export type AuthViewState = "default" | "loading" | "error" | "success";
export type FieldErrors = Record<string, string>;
export const demoVerificationCode = "123456";
export function validEmail(value: string) {
  return value.trim().length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
export function validBangladeshPhone(value: string) {
  return /^01[3-9]\d{8}$/.test(value.trim());
}
export function passwordStrength(value: string) {
  const checks = [
    value.length >= 8,
    /[a-z]/.test(value) && /[A-Z]/.test(value),
    /\d/.test(value),
    /[^a-zA-Z0-9]/.test(value),
  ];
  return checks.filter(Boolean).length;
}
export function validateLogin(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!validEmail(email)) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Enter your password.";
  return errors;
}
export function validateRegistration(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
  terms: boolean;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (input.name.trim().length < 2 || input.name.trim().length > 80)
    errors.name = "Enter your full name (2–80 characters).";
  if (!validEmail(input.email)) errors.email = "Enter a valid email address.";
  if (!validBangladeshPhone(input.phone))
    errors.phone = "Use an 11-digit Bangladesh number, such as 01712345678.";
  if (input.password.length < 8 || passwordStrength(input.password) < 3)
    errors.password = "Use 8+ characters with at least two of: mixed case, numbers, and symbols.";
  if (!input.terms) errors.terms = "Please agree to the Terms of Service and Privacy Policy.";
  return errors;
}
export function normalizeOtp(value: string) {
  return value
    .replace(/[০-৯]/g, (digit) => String("০১২৩৪৫৬৭৮৯".indexOf(digit)))
    .replace(/\D/g, "")
    .slice(0, 6);
}
export function applyOtpInput(previous: string[], value: string, index: number) {
  const numeric = normalizeOtp(value);
  const digits = [...previous];
  if (!numeric) {
    digits[index] = "";
    return { digits, nextIndex: index };
  }
  const start = numeric.length === 6 ? 0 : index;
  numeric
    .slice(0, 6 - start)
    .split("")
    .forEach((digit, offset) => {
      digits[start + offset] = digit;
    });
  return { digits, nextIndex: Math.min(5, start + numeric.length) };
}
export function remainingSeconds(deadline: number, now: number) {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}
export function countdownLabel(seconds: number) {
  const value = Math.min(60, Math.max(0, seconds));
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}
export function demoDestination(role: SignupRole) {
  return role === "Buyer" ? "/account/overview" : "/workspace/overview";
}
export function liveDestination(role: string) {
  return role === "ADMIN" ? "/admin/dashboard" : role === "VENDOR" ? "/vendor/dashboard" : "/";
}
