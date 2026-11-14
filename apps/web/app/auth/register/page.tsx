import { RegisterForm } from "@/components/auth/register/RegisterForm";
import { Suspense } from "react";
import { AuthFormLoading } from "@/components/auth/states/AuthFormLoading";
export interface RegisterPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}
export default function RegisterPage(props: RegisterPageProps) {
  void props;
  return (
    <Suspense fallback={<AuthFormLoading />}>
      <RegisterForm />
    </Suspense>
  );
}
