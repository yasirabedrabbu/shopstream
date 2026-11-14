"use client";
import { useEffect, useRef, useState } from "react";
import { DEMO_MODE } from "@/lib/demo";
import { remainingSeconds } from "@/lib/auth-pages/model";
import { useActive, previewDelay } from "../useActive";
export interface CooldownOptions {
  disabled: boolean;
  onReset: () => void;
  onError: (message: string) => void;
}
export function useCooldown({ disabled, onReset, onError }: CooldownOptions) {
  const deadline = useRef(0);
  const [seconds, setSeconds] = useState(60);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const active = useActive();
  useEffect(() => {
    deadline.current = Date.now() + 60000;
    const interval = window.setInterval(
      () => setSeconds(remainingSeconds(deadline.current, Date.now())),
      1000,
    );
    return () => window.clearInterval(interval);
  }, []);
  async function resend() {
    if (seconds > 0 || disabled || resending) return;
    setResending(true);
    setResent(false);
    await previewDelay(700);
    if (!active.current) return;
    setResending(false);
    if (!DEMO_MODE) {
      onError("Verification email delivery is not configured. No code has been sent.");
      return;
    }
    deadline.current = Date.now() + 60000;
    setSeconds(60);
    setResent(true);
    onReset();
  }
  return { seconds, resending, resent, resend };
}
