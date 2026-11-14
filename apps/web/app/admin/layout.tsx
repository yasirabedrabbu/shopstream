// apps/web/src/app/admin/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, BottomDock, type SidebarLink } from "@/components/Sidebar";
import { getUser } from "@/lib/auth";

const links: SidebarLink[] = [
  { href: "/admin/dashboard", label: "Overview", icon: "dashboard" },
  { href: "/admin/vendors", label: "Vendors", icon: "store" },
  { href: "/admin/products", label: "Products", icon: "box" },
  { href: "/admin/users", label: "Users", icon: "users" },
  { href: "/admin/categories", label: "Categories", icon: "tag" },
  { href: "/admin/payments", label: "Payments", icon: "wallet" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== "ADMIN") {
      router.push("/auth/login");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      <Sidebar links={links} title="Admin" />
      <main className="flex-1 min-w-0 overflow-auto pb-24 md:pb-0">{children}</main>
      <BottomDock links={links} />
    </div>
  );
}