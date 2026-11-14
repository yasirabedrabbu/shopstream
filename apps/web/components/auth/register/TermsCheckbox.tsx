"use client";
import { useId } from "react";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { TermsError } from "./TermsError";
export interface TermsCheckboxProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  error?: string;
  disabled: boolean;
}
export function TermsCheckbox({ checked, onChange, error, disabled }: TermsCheckboxProps) {
  const id = useId();
  return (
    <div className="a-terms">
      <div className="a-terms-row">
        <Input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          aria-label="I agree to the Terms of Service and Privacy Policy"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className="a-checkbox"
        />
        <label htmlFor={id}>
          <span className="p-text p-small">
            I agree to the{" "}
            <Link
              href="/terms"
              target="_blank"
              rel="noreferrer"
              className="a-policy-link"
              aria-label="Terms of Service (opens in a new tab)"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              target="_blank"
              rel="noreferrer"
              className="a-policy-link"
              aria-label="Privacy Policy (opens in a new tab)"
            >
              Privacy Policy
            </Link>
          </span>
        </label>
      </div>
      <TermsError id={`${id}-error`} message={error} />
    </div>
  );
}
