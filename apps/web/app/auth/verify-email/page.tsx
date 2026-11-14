import { VerifyEmailForm } from "@/components/auth/verify-email/VerifyEmailForm";
import { Suspense } from "react";
import { AuthFormLoading } from "@/components/auth/states/AuthFormLoading";
export interface VerifyEmailPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}
export default function VerifyEmailPage(props: VerifyEmailPageProps) {
  void props;
  return (
    <Suspense fallback={<AuthFormLoading />}>
      <VerifyEmailForm />
    </Suspense>
  );
}
