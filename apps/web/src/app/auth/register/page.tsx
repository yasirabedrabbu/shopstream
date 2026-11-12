// apps/web/src/app/auth/register/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useToast } from "@/components/Toast";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.register(name, email, password);
      toast("Account created! Please sign in.", "success");
      router.push("/auth/login");
    } catch {
      toast("Registration failed. Email may already be in use.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border p-8 flex flex-col gap-6"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div>
          <Link href="/" className="text-sm font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
            ShopStream
          </Link>
          <h1 className="text-2xl font-bold mt-4" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
            Create account
          </h1>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {[
            { label: "Name", type: "text", value: name, set: setName },
            { label: "Email", type: "email", value: email, set: setEmail },
            { label: "Password", type: "password", value: password, set: setPassword },
          ].map(({ label, type, value, set }) => (
            <div key={label} className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "var(--text)" }}>
                {label}
              </label>
              <input
                type={type}
                required
                value={value}
                onChange={(e) => set(e.target.value)}
                className="h-11 px-4 rounded-xl border text-sm outline-none focus:border-[#E8F44A]"
                style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="h-11 rounded-xl bg-[#E8F44A] text-zinc-900 font-semibold text-sm disabled:opacity-60 mt-1"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold hover:underline" style={{ color: "var(--text)" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}