// apps/web/src/lib/auth.ts
"use client";

import { useSyncExternalStore } from "react";
import { clearTokens } from "./api";
import type { UserResponse } from "./types";

const USER_KEY = "ss_user";

export function saveUser(user: UserResponse) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("shopstream:session"));
}

export function getUser(): UserResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserResponse) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  clearTokens();
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event("shopstream:session"));
  }
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("ss_access");
}

export function getUserRole(): UserResponse["role"] | null {
  return getUser()?.role ?? null;
}

function subscribeUser(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("shopstream:session", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("shopstream:session", callback);
  };
}

function userSnapshot() {
  try {
    return window.localStorage.getItem(USER_KEY) ?? "";
  } catch {
    return "";
  }
}

export function useStoredUser(): UserResponse | null {
  const raw = useSyncExternalStore(subscribeUser, userSnapshot, () => "");
  try {
    return raw ? (JSON.parse(raw) as UserResponse) : null;
  } catch {
    return null;
  }
}
