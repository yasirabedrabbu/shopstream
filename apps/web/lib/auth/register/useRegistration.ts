"use client";
import type { FormEvent } from "react";
import { DEMO_MODE } from "@/lib/demo";
import { validateRegistration } from "@/lib/auth-pages/model";
import { useAuthPreview } from "../context";
import { useFormModel } from "../useFormModel";
import { useAuthRoute } from "../useAuthRoute";
import { register } from "../operations";
export function useRegistration() {
  const context = useAuthPreview();
  const route = useAuthRoute();
  const form = useFormModel(
    { name: "", email: context.email, phone: "", password: "", role: context.role, terms: false },
    {
      name: "Enter your full name.",
      email: "Enter a valid email address.",
      phone: "Use a number like 01712345678.",
      password: "Choose a stronger password.",
      terms: "Please agree before continuing.",
    },
  );
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (form.busy) return;
    const issues = validateRegistration(form.values);
    form.setErrors(issues);
    if (Object.keys(issues).length) {
      form.setMessage("A few details need another look.");
      form.setStatus("error");
      return;
    }
    form.setMessage("");
    form.setStatus("loading");
    try {
      await register(form.values);
      if (!form.active.current) return;
      context.setEmail(form.values.email.trim());
      context.setRole(form.values.role);
      form.update("password", "");
      form.setStatus("success");
    } catch (error) {
      if (!form.active.current) return;
      form.setMessage(
        error instanceof Error
          ? error.message
          : "We couldn’t create the account. Please check your details or try signing in.",
      );
      form.setErrors({ email: "Check this address or try signing in." });
      form.setStatus("error");
    }
  }
  const errorMessage =
    form.state === "error"
      ? context.preview === "error"
        ? "Please check the highlighted details before continuing."
        : form.message
      : "";
  return { ...form, ...route, submit, errorMessage, demo: DEMO_MODE || context.preview === "success" };
}
export type RegistrationModel = ReturnType<typeof useRegistration>;
