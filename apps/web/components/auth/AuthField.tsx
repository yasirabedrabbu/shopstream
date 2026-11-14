import type { InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/Input";
export interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}
export function AuthField({ label, error, className = "", ...props }: AuthFieldProps) {
  return (
    <div className={`a-field ${className}`}>
      <Input label={label} error={error} {...props} />
    </div>
  );
}
