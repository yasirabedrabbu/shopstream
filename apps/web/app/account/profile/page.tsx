"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountFrame } from "@/components/account/AccountFrame";
import { authApi } from "@/lib/api";
import { clearSession } from "@/lib/auth";
import type { UserResponse } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    authApi
      .me()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Your profile could not be loaded.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function signOut() {
    clearSession();
    router.push("/");
  }

  return (
    <AccountFrame title="Profile" subtitle="Your account details.">
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      {!user && !error && (
        <p role="status" className="text-text-muted">
          Loading profile…
        </p>
      )}
      {user && (
        <div className="max-w-md rounded-xl border border-border p-5">
          <dl className="grid gap-4 text-sm">
            <div>
              <dt className="text-text-muted">Name</dt>
              <dd className="font-medium">{user.fullName}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Email</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Account type</dt>
              <dd className="font-medium">{user.role}</dd>
            </div>
          </dl>
          <button
            onClick={signOut}
            className="mt-6 min-h-11 rounded-xl border border-border px-5 text-sm text-danger"
          >
            Sign out
          </button>
        </div>
      )}
    </AccountFrame>
  );
}