"use client";
import type { FormEvent } from "react";
import { useState } from "react";
import { DEMO_MODE } from "@/lib/demo";
import { demoDestination, validateLogin } from "@/lib/auth-pages/model";
import { useAuthPreview } from "../context";
import { useFormModel } from "../useFormModel";
import { useAuthRoute } from "../useAuthRoute";
import { login } from "../operations";
export function useLogin() {
  const context = useAuthPreview();
  const route = useAuthRoute();
  const form = useFormModel(
    { email: context.email, password: "" },
    { email: "We couldn’t find a match for these details.", password: "Check your password and try again." },
  );
  const [destination, setDestination] = useState(route.returnTo ?? demoDestination(context.role));
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (form.busy) return;
    const issues = validateLogin(form.values.email, form.values.password);
    form.setErrors(issues);
    if (Object.keys(issues).length) {
      form.setStatus("error");
      form.setMessage("Please check the highlighted fields.");
      return;
    }
    form.setStatus("loading");
    form.setMessage("");
    try {
      const target = await login({
        ...form.values,
        role: context.role,
        returnTo: route.returnTo,
        active: form.active,
      });
      if (!form.active.current) return;
      setDestination(target);
      context.setEmail(form.values.email.trim());
      form.update("password", "");
      form.setStatus("success");
    } catch {
      if (!form.active.current) return;
      form.setErrors({ email: "Check your email address.", password: "Check your password." });
      form.setMessage("We couldn’t sign you in. Check your details or try again in a moment.");
      form.setStatus("error");
    }
  }
  const errorMessage =
    form.state === "error"
      ? context.preview === "error"
        ? "We couldn’t sign you in. Check your details and try again."
        : form.message
      : "";
  return {
    ...form,
    ...route,
    submit,
    destination,
    errorMessage,
    demo: DEMO_MODE || context.preview === "success",
  };
}
export type LoginModel = ReturnType<typeof useLogin>;
