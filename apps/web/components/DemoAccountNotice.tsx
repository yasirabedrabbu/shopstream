"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { safeReturnPath } from "@/lib/demo";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { Icon } from "./ui/Icon";
import { buttonClasses } from "./ui/Button";

function NoticeContent({ kind }: { kind: "account" | "orders" }) {
  const params = useSearchParams();
  const destination = safeReturnPath(params.get("next")) ?? "/products";
  return (
    <section className="mx-auto max-w-xl py-14 text-center">
      <span className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full bg-surface">
        <Icon name={kind === "orders" ? "receipt" : "user"} size={24} />
      </span>
      <p className="eyebrow mb-3 text-text-muted">Explore without an account</p>
      <h1 className="text-3xl font-semibold tracking-tight">
        {kind === "orders"
          ? "No real orders in this preview."
          : "A look around. No sign-up needed."}
      </h1>
      <p className="mt-5 text-sm leading-relaxed text-text-muted">
        {kind === "orders"
          ? "Demo checkout does not place or save orders. You can browse the sample collection and try the checkout as often as you like."
          : "Accounts aren’t connected in this frontend demo, so we won’t ask for a password or personal information. You can still explore every sample product and try checkout as a guest."}
      </p>
      <Link href={destination} className={buttonClasses({ className: "mt-7" })}>
        {destination.startsWith("/checkout")
          ? "Continue to demo checkout"
          : "Explore the collection"}
        <Icon name="arrowRight" size={16} />
      </Link>
      <Link
        href="/"
        className="mx-auto mt-3 flex min-h-11 w-fit items-center text-sm text-text-muted underline underline-offset-4"
      >
        Back to home
      </Link>
    </section>
  );
}

export function DemoAccountNotice({
  kind = "account",
}: {
  kind?: "account" | "orders";
}) {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Nav />
      <main id="main-content" tabIndex={-1} className="page-width">
        <Suspense
          fallback={
            <p role="status" className="py-20">
              Loading preview…
            </p>
          }
        >
          <NoticeContent kind={kind} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
