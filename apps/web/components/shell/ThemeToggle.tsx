"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/Icon";

const KEY = "ss_theme";
type Theme = "light" | "dark";

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", cb);
  return () => {
    listeners.delete(cb);
    mq.removeEventListener("change", cb);
  };
}

function getSnapshot(): Theme {
  const v = document.documentElement.dataset.theme;
  return v === "dark" || v === "light" ? v : systemTheme();
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => "light" as Theme);

  // Apply the saved choice once on mount (the DOM is the external system here).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "dark" || saved === "light") {
        document.documentElement.dataset.theme = saved;
        emit();
      }
    } catch {
      /* storage blocked: system theme applies */
    }
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
    emit();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-card text-text-muted transition hover:text-text focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus/30"
    >
      <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
    </button>
  );
}
