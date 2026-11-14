"use client";
import { useId, useState, type KeyboardEvent } from "react";
import { applyOtpInput } from "@/lib/auth-pages/model";
export function useOtp(clearError: () => void) {
  const id = useId();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  function focus(index: number) {
    const field = document.getElementById(`${id}-${index}`) as HTMLInputElement | null;
    field?.focus();
    field?.select();
  }
  function change(value: string, index: number) {
    const next = applyOtpInput(digits, value, index);
    setDigits(next.digits);
    clearError();
    focus(next.nextIndex);
  }
  function keyDown(event: KeyboardEvent<HTMLInputElement>, index: number) {
    if (event.key === "Backspace") {
      event.preventDefault();
      const next = [...digits];
      if (next[index]) next[index] = "";
      else if (index > 0) {
        next[index - 1] = "";
        focus(index - 1);
      }
      setDigits(next);
      clearError();
    } else if (event.key === "Delete") {
      event.preventDefault();
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      clearError();
    } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      focus(Math.min(5, Math.max(0, index + (event.key === "ArrowLeft" ? -1 : 1))));
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      focus(event.key === "Home" ? 0 : 5);
    }
  }
  function reset() {
    setDigits(Array(6).fill(""));
    focus(0);
  }
  return { id, digits, focus, change, keyDown, reset };
}
