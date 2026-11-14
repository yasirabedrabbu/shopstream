"use client";
import { useState } from "react";
import { useAuthPreview } from "./context";
import { useActive } from "./useActive";
import type { AuthViewState, FieldErrors } from "@/lib/auth-pages/model";
export function useFormModel<T extends object>(initial: T, previewErrors: FieldErrors) {
  const context = useAuthPreview();
  const [values, setValues] = useState(initial);
  const [status, setStatus] = useState<AuthViewState>("default");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const active = useActive();
  const state = context.preview === "default" ? status : context.preview;
  function update<K extends keyof T>(field: K, value: T[K]) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: "" }));
  }
  return {
    context,
    values,
    update,
    state,
    busy: state === "loading",
    active,
    setStatus,
    setErrors,
    setMessage,
    message,
    errors: context.preview === "error" ? previewErrors : errors,
  };
}
