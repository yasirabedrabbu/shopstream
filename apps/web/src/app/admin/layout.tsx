// apps/web/src/app/admin/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, BottomDock } from "@/components/Sidebar";
import { getUser } from "@/lib/auth";

const links = [
  { href: "/admin/dashboard", label: "Overview", icon: "◈" },
  { href: "/admin/vendors", label: "Vendors", icon: "◻" },
  { href: "/admin/products", label: "Products", icon: "▣" },
  { href: "/admin/users", label: "Users", icon: "◎" },
  { href: "/admin/categories", label: "Categories", icon: "◆" },
  { href: "/admin/payments", label: "Payments", icon: "◑" },
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
      <main className="flex-1 overflow-auto pb-20 md:pb-0">{children}</main>
      <BottomDock links={links} />
    </div>
  );
}