import type { FormHTMLAttributes } from "react";
export interface AuthFormProps extends FormHTMLAttributes<HTMLFormElement> {
  noValidate?: true;
}
export function AuthForm(props: AuthFormProps) {
  return <form {...props} noValidate />;
}
