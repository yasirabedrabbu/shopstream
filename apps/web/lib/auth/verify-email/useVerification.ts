"use client";
import type { FormEvent } from "react";
import { DEMO_MODE } from "@/lib/demo";
import { demoDestination, demoVerificationCode } from "@/lib/auth-pages/model";
import { useFormModel } from "../useFormModel";
import { useAuthRoute } from "../useAuthRoute";
import { previewDelay } from "../useActive";
import { useOtp } from "./useOtp";
import { useCooldown } from "./useCooldown";
export function useVerification() {
  const form = useFormModel({}, {});
  const route = useAuthRoute();
  function clearError() {
    form.setMessage("");
    if (form.state === "error") form.setStatus("default");
  }
  const otp = useOtp(clearError);
  const cooldown = useCooldown({
    disabled: form.busy,
    onReset: () => {
      otp.reset();
      form.setMessage("");
      form.setStatus("default");
    },
    onError: (message) => {
      form.setMessage(message);
      form.setStatus("error");
    },
  });
  const busy = form.busy || cooldown.resending;
  async function verify(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (otp.digits.join("").length !== 6) {
      form.setMessage("Enter all six digits from your verification code.");
      form.setStatus("error");
      otp.focus(otp.digits.findIndex((digit) => !digit));
      return;
    }
    form.setStatus("loading");
    form.setMessage("");
    await previewDelay();
    if (!form.active.current) return;
    if (!DEMO_MODE) {
      form.setMessage(
        "Email verification is not configured for the connected API. Contact support to verify your account.",
      );
      form.setStatus("error");
      return;
    }
    if (otp.digits.join("") !== demoVerificationCode) {
      form.setMessage("That code doesn’t match. In this preview, use 123456.");
      form.setStatus("error");
      otp.focus(0);
      return;
    }
    otp.reset();
    form.setStatus("success");
  }
  return {
    ...form,
    ...otp,
    ...cooldown,
    ...route,
    busy,
    verify,
    email: form.context.email || "nabila@example.com",
    destination: route.returnTo ?? demoDestination(form.context.role),
    visibleError:
      form.context.preview === "error"
        ? "That code doesn’t match. Check all six digits and try again."
        : form.message,
  };
}
export type VerificationModel = ReturnType<typeof useVerification>;
