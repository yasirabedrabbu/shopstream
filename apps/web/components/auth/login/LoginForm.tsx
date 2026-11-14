"use client";
import { useLogin } from "@/lib/auth/login/useLogin";
import { FormHeading } from "../FormHeading";
import { AuthState } from "../states/AuthState";
import { LoginContent } from "./LoginContent";
import { LoginSuccess } from "./LoginSuccess";
export interface LoginFormProps {
  id?: string;
}
export function LoginForm({ id }: LoginFormProps) {
  const model = useLogin();
  return (
    <div id={id} data-frame="auth/login" data-auth-state={model.state}>
      <FormHeading title="Welcome back" subtitle={"A little something good is waiting for you."} />
      <AuthState state={model.state} success={<LoginSuccess model={model} />}>
        <LoginContent model={model} />
      </AuthState>
    </div>
  );
}
