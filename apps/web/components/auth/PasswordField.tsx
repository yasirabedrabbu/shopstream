"use client";
import { useState, type InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthIcon } from "./AuthIcon";
export interface PasswordFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  helper?: string;
}
export function PasswordField({ error, helper, disabled, ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="a-field a-password-field">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        label="Password"
        error={error}
        helper={helper}
        disabled={disabled}
      />
      <Button
        variant="ghost"
        className="a-password-toggle"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        disabled={disabled}
        onClick={() => setVisible((value) => !value)}
      >
        <AuthIcon name={visible ? "eyeOff" : "eye"} className="a-icon-sm" />
      </Button>
    </div>
  );
}
