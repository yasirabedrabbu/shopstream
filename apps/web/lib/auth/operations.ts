import { DEMO_MODE } from "@/lib/demo";
import { authApi, saveTokens } from "@/lib/api";
import { saveUser } from "@/lib/auth";
import { demoDestination, liveDestination, type SignupRole } from "@/lib/auth-pages/model";
import { previewDelay } from "./useActive";
export interface LoginInput {
  email: string;
  password: string;
  role: SignupRole;
  returnTo: string | null;
  active: { current: boolean };
}
export async function login(input: LoginInput) {
  if (DEMO_MODE) {
    await previewDelay();
    return input.returnTo ?? demoDestination(input.role);
  }
  const result = await authApi.login(input.email.trim(), input.password);
  if (input.active.current) {
    saveTokens(result.accessToken, result.refreshToken);
    saveUser(result.user);
  }
  return input.returnTo ?? liveDestination(result.user.role);
}
export interface RegistrationInput {
  name: string;
  email: string;
  password: string;
  role: SignupRole;
}
export async function register(input: RegistrationInput) {
  if (DEMO_MODE) {
    await previewDelay();
    return;
  }
  if (input.role !== "Buyer")
    throw Error(
      "The connected API supports buyer signup only. Seller and business onboarding is not configured; choose Buyer or contact support.",
    );
  await authApi.register(input.name.trim(), input.email.trim(), input.password);
}
export async function requestReset() {
  await previewDelay();
  if (!DEMO_MODE)
    throw Error(
      "Reset-email delivery is not configured for the connected API. Contact support for account recovery.",
    );
}
