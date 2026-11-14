"use client";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main-content" className="page-width py-24 text-center">
      <h1 className="text-3xl font-semibold">Something didn’t quite load.</h1>
      <p className="mt-4 text-sm text-text-muted">
        Please try again, or return to the collection.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className={buttonClasses()}>
          Try again
        </button>
        <Link
          href="/products"
          className={buttonClasses({ variant: "secondary" })}
        >
          Explore products
        </Link>
      </div>
    </main>
  );
}
