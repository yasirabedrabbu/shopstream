import type { LoginModel } from "@/lib/auth/login/useLogin";
import { AuthForm } from "../AuthForm";
import { AuthLink } from "../AuthLink";
import { LoginFields } from "./LoginFields";
import { AuthSubmit } from "../AuthSubmit";
import { FormError } from "../states/FormError";
export interface LoginContentProps {
  model: LoginModel;
}
export function LoginContent({ model }: LoginContentProps) {
  return (
    <>
      <AuthForm className="a-form" onSubmit={model.submit}>
        <LoginFields model={model} />
        <div className="a-forgot-row">
          <AuthLink href="/auth/forgot-password">Forgot password?</AuthLink>
        </div>
        <FormError message={model.errorMessage} />
        <AuthSubmit loading={model.busy} loadingLabel="Signing in">
          Sign in
        </AuthSubmit>
      </AuthForm>
      <div className="a-divider">
        <span />
        <span className="p-text p-small p-tone-muted">or</span>
        <span />
      </div>
      <p className="p-text p-body p-tone-muted a-switch-copy">
        New to ShopStream? <AuthLink href={`/auth/register${model.nextQuery}`}>Create an account</AuthLink>
      </p>
    </>
  );
}
