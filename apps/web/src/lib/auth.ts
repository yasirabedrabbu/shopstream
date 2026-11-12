// apps/web/src/lib/auth.ts
"use client";

import { saveTokens, clearTokens } from "./api";
import type { UserResponse } from "./types";

const USER_KEY = "ss_user";

export function saveUser(user: UserResponse) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
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
  }
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("ss_access");
}

export function getUserRole(): UserResponse["role"] | null {
  return getUser()?.role ?? null;
}