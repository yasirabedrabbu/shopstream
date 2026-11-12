// apps/web/src/app/auth/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { saveTokens } from "@/lib/api";
import { saveUser } from "@/lib/auth";
import { useToast } from "@/components/Toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      saveTokens(res.accessToken, res.refreshToken);
      saveUser(res.user);
      toast("Welcome back!", "success");
      const role = res.user.role;
      if (role === "ADMIN") router.push("/admin/dashboard");
      else if (role === "VENDOR") router.push("/vendor/dashboard");
      else router.push("/");
    } catch {
      toast("Invalid email or password.", "error");
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
          <Link
            href="/"
            className="text-sm font-bold"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}
          >
            ShopStream
          </Link>
          <h1
            className="text-2xl font-bold mt-4"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}
          >
            Sign in
          </h1>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--text)" }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 px-4 rounded-xl border text-sm outline-none focus:border-[#E8F44A]"
              style={{
                background: "var(--bg)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--text)" }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 px-4 rounded-xl border text-sm outline-none focus:border-[#E8F44A]"
              style={{
                background: "var(--bg)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="h-11 rounded-xl bg-[#E8F44A] text-zinc-900 font-semibold text-sm disabled:opacity-60 mt-1"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
          No account?{" "}
          <Link href="/auth/register" className="font-semibold hover:underline" style={{ color: "var(--text)" }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}