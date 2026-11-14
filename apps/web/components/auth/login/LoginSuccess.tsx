import type { LoginModel } from "@/lib/auth/login/useLogin";
import { SuccessPanel } from "../states/SuccessPanel";
import { ContinueLink } from "../ContinueLink";
export interface LoginSuccessProps {
  model: LoginModel;
}
export function LoginSuccess({ model }: LoginSuccessProps) {
  return (
    <SuccessPanel
      title="You’re all set"
      actions={
        <ContinueLink href={model.destination}>
          {model.demo ? "Explore the dashboard" : "Continue to your account"}
        </ContinueLink>
      }
    >
      {model.demo
        ? "Preview sign-in complete. No authenticated session was created, and no credentials were saved."
        : "You’re signed in. Continue to pick up where you left off."}
    </SuccessPanel>
  );
}
