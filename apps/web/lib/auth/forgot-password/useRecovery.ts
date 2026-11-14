"use client";
import type { FormEvent } from "react";
import { validEmail } from "@/lib/auth-pages/model";
import { useAuthPreview } from "../context";
import { useFormModel } from "../useFormModel";
import { requestReset } from "../operations";
export function useRecovery() {
  const context = useAuthPreview();
  const form = useFormModel({ email: context.email }, { email: "Check the email address and try again." });
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (form.busy) return;
    if (!validEmail(form.values.email)) {
      form.setErrors({ email: "Enter a valid email address." });
      form.setMessage("Please check the email address below.");
      form.setStatus("error");
      return;
    }
    form.setErrors({});
    form.setMessage("");
    form.setStatus("loading");
    try {
      await requestReset();
      if (!form.active.current) return;
      context.setEmail(form.values.email.trim());
      form.setStatus("success");
    } catch (error) {
      if (!form.active.current) return;
      form.setMessage(
        error instanceof Error ? error.message : "We couldn’t complete this request. Please try again.",
      );
      form.setStatus("error");
    }
  }
  const errorMessage =
    form.state === "error"
      ? context.preview === "error"
        ? "We couldn’t complete this request. Please try again."
        : form.message
      : "";
  return { ...form, submit, errorMessage };
}
export type RecoveryModel = ReturnType<typeof useRecovery>;
