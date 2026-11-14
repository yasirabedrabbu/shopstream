import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Nav />
      <main
        id="main-content"
        tabIndex={-1}
        className="page-width py-24 text-center"
      >
        <p className="eyebrow text-text-muted">A little detour · 404</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          This find got away.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-text-muted">
          That page isn’t here, but there’s plenty more to explore.
        </p>
        <Link href="/products" className={buttonClasses({ className: "mt-7" })}>
          Back to the collection
        </Link>
      </main>
      <Footer />
    </div>
  );
}
