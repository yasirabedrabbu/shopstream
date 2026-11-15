"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";

// Sends signed-out visitors to login, then returns them to the page they wanted.
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
    } else {
      setReady(true);
    }
  }, [router, pathname]);

  if (!ready) {
    return (
      <div role="status" className="page-width py-16 text-text-muted">
        Loading your account…
      </div>
    );
  }
  return <>{children}</>;
}