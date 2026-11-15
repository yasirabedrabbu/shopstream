"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, getUser } from "@/lib/auth";
import { Avatar } from "./ui";

const NAV = [
  { href: "/studio", label: "Overview", d: "M3 12 12 3l9 9M5 10v10h14V10" },
  { href: "/studio/inventory", label: "Inventory", d: "M21 8 12 3 3 8l9 5 9-5ZM3 8v8l9 5 9-5V8" },
  { href: "/studio/orders", label: "Orders", d: "M6 6h15l-1.5 9h-12ZM6 6 5 3H2M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" },
];

function NavIcon({ d }: { d: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export function StudioShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();

  function signOut() {
    clearSession();
    router.push("/auth/login");
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-stone-200 bg-white p-5 lg:flex">
          <Link href="/studio" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-500 text-sm font-bold text-white">S</span>
            <span className="text-base font-semibold tracking-tight">ShopStream</span>
          </Link>

          <nav aria-label="Seller navigation" className="mt-8 flex flex-col gap-1">
            {NAV.map((item) => {
              const active = item.href === "/studio" ? pathname === "/studio" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm transition ${
                    active ? "bg-stone-900 font-medium text-white" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                >
                  <NavIcon d={item.d} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-stone-200 p-4">
            <div className="flex items-center gap-3">
              <Avatar name={user?.fullName ?? "Seller"} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user?.fullName ?? "Seller"}</p>
                <p className="text-xs text-stone-500">Seller account</p>
              </div>
            </div>
            <div className="mt-3 flex gap-4 text-xs">
              <Link href="/workspace/settings/store" className="text-stone-600 underline underline-offset-4 hover:text-stone-900">
                Store settings
              </Link>
              <button onClick={signOut} className="text-stone-600 underline underline-offset-4 hover:text-stone-900">
                Sign out
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <nav aria-label="Seller navigation mobile" className="flex gap-2 overflow-x-auto border-b border-stone-200 bg-white px-4 py-3 lg:hidden">
            {NAV.map((item) => {
              const active = item.href === "/studio" ? pathname === "/studio" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-sm ${
                    active ? "bg-stone-900 text-white" : "border border-stone-200 text-stone-700"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <main id="main-content" tabIndex={-1} className="flex-1 px-4 py-6 md:px-8 md:py-8">
            <div className="mx-auto max-w-7xl space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}