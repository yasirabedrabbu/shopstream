// apps/web/src/components/LegalPage.tsx
import type { ReactNode } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { DEMO_MODE } from "@/lib/demo";

interface LegalPageProps {
  title: string;
  updated: string;
  children: ReactNode;
}

export function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <>
      <Nav />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-3xl px-4 py-12 md:py-16"
      >
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-text md:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-text-muted">Last updated: {updated}</p>
        {DEMO_MODE && (
          <p className="mt-6 rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed text-text-muted">
            This is a frontend preview. The information below describes the
            intended live service; accounts, purchases, payment processing, and
            live support are not connected in this demo.
          </p>
        )}

        <div className="mt-8 flex flex-col gap-5 text-[15px] leading-relaxed text-text [&_h2]:mt-4 [&_h2]:font-[family-name:var(--font-heading)] [&_h2]:text-lg [&_h2]:font-semibold [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5 [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-4">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
