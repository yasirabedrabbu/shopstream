import { ForgotPasswordForm } from "@/components/auth/forgot-password/ForgotPasswordForm";
export interface ForgotPasswordPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}
export default function ForgotPasswordPage(props: ForgotPasswordPageProps) {
  void props;
  return <ForgotPasswordForm />;
}
