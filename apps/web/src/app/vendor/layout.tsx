// apps/web/src/app/vendor/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, BottomDock, type SidebarLink } from "@/components/Sidebar";
import { getUser } from "@/lib/auth";

const links: SidebarLink[] = [
  { href: "/vendor/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/vendor/products", label: "Products", icon: "box" },
  { href: "/vendor/orders", label: "Orders", icon: "receipt" },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (!user || (user.role !== "VENDOR" && user.role !== "ADMIN")) {
      router.push("/auth/login");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      <Sidebar links={links} title="Vendor" />
      <main className="flex-1 min-w-0 overflow-auto pb-24 md:pb-0">{children}</main>
      <BottomDock links={links} />
    </div>
  );
}