import { DEMO_MODE } from "@/lib/demo";
import Link from "next/link";

export function DemoBanner() {
  if (!DEMO_MODE) return null;
  return (
    <div className="border-b border-border bg-surface px-4 py-2 text-center text-xs leading-relaxed text-text-muted">
      <span className="font-semibold text-text">You’re exploring a demo.</span>{" "}
      Sample products. No real orders or payments.{" "}
      <Link href="/#how-it-works" className="underline underline-offset-4">
        How it works
      </Link>
    </div>
  );
}
