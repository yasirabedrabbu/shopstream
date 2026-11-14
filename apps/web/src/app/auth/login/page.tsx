// apps/web/src/app/auth/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi, saveTokens } from "@/lib/api";
import { saveUser } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthShell } from "@/components/AuthShell";

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
      toast("Email or password is incorrect.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Sign in to manage your store or track your orders."
      footer={
        <>
          New here?{" "}
          <Link
            href="/auth/register"
            className="rounded font-semibold text-text underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus)]"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-5">
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" size="lg" loading={loading} className="mt-1 w-full">
          {loading ? "Signing in" : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}