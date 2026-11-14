import { LoginForm } from "@/components/auth/login/LoginForm";
import { Suspense } from "react";
import { AuthFormLoading } from "@/components/auth/states/AuthFormLoading";
export interface LoginPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}
export default function LoginPage(props: LoginPageProps) {
  void props;
  return (
    <Suspense fallback={<AuthFormLoading />}>
      <LoginForm />
    </Suspense>
  );
}
