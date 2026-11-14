"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { confirmReset } from "@/lib/auth/operations";

type Status = "idle" | "loading" | "done" | "error";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") ?? "");
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (status === "loading") return;

    if (!token) {
      setStatus("error");
      setMessage("This reset link is missing its token. Request a new link.");
      return;
    }
    if (password.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setStatus("error");
      setMessage("The two passwords do not match.");
      return;
    }

    setStatus("loading");
    setMessage("");
    try {
      await confirmReset(token, password);
      setStatus("done");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "We couldn’t reset your password. Please request a new link.",
      );
    }
  }

  if (status === "done") {
    return (
      <main className="mx-auto max-w-md p-6">
        <h1 className="text-2xl font-semibold text-text">Password updated</h1>
        <p className="mt-3 text-text-muted">You can now sign in with your new password.</p>
        <Link
          href="/auth/login"
          className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[var(--accent)] px-5 text-[var(--accent-text)]"
        >
          Go to sign in
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold text-text">Set a new password</h1>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1">
          <label htmlFor="new-password" className="text-sm font-medium text-text">
            New password
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={100}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-h-11 rounded-xl border border-border px-4 text-text"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="confirm-password" className="text-sm font-medium text-text">
            Confirm new password
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="min-h-11 rounded-xl border border-border px-4 text-text"
          />
        </div>

        {message && (
          <p role="alert" className="text-sm text-red-600">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="min-h-11 rounded-xl bg-[var(--accent)] px-5 font-medium text-[var(--accent-text)] disabled:opacity-60"
        >
          {status === "loading" ? "Saving…" : "Update password"}
        </button>
      </form>
    </main>
  );
}