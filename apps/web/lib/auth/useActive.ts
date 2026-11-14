"use client";
import { useEffect, useRef } from "react";
export function useActive() {
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  return active;
}
export const previewDelay = (milliseconds = 800) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));
