"use client";

import { useRouter } from "next/navigation";
import { clearSession, useStoredUser } from "@/lib/auth";
import { DashboardShell, type ShellNavItem } from "@/components/shell/DashboardShell";

const NAV: ShellNavItem[] = [
  { href: "/studio", label: "Overview", icon: "dashboard", exact: true },
  { href: "/studio/inventory", label: "Inventory", icon: "box" },
  { href: "/studio/orders", label: "Orders", icon: "receipt" },
];

export function StudioShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useStoredUser();

  function signOut() {
    clearSession();
    router.push("/auth/login");
  }

  return (
    <DashboardShell
      brand={{ href: "/studio", role: "Seller studio" }}
      nav={NAV}
      user={user ? { name: user.fullName, caption: "Seller account" } : null}
      footerLinks={[{ href: "/workspace/settings/store", label: "Store settings" }]}
      onSignOut={signOut}
    >
      {children}
    </DashboardShell>
  );
}
