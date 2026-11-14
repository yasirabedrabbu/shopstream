"use client";
import { useSearchParams } from "next/navigation";
import { safeReturnPath } from "@/lib/demo";
export function useAuthRoute() {
  const params = useSearchParams();
  const returnTo = safeReturnPath(params.get("next"));
  return { returnTo, nextQuery: returnTo ? `?next=${encodeURIComponent(returnTo)}` : "" };
}
