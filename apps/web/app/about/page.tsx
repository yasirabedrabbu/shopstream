// apps/web/src/app/about/page.tsx
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <LegalPage title={`About ${SITE.name}`} updated={SITE.lastUpdated}>
      <p>
        {SITE.name} helps Bangladeshi sellers open an online store, list products and manage orders from one
        dashboard. Buyers get one place to shop from many stores.
      </p>

      <h2>What we focus on</h2>
      <ul>
        <li>Simple setup, so a seller can start selling the same day.</li>
        <li>Accurate stock, so buyers see what is really available.</li>
        <li>Clear order status for buyers and sellers.</li>
      </ul>

      <h2>Built in Bangladesh</h2>
      <p>
        We design for Bangla and English users, local payment options and the way local sellers work.
      </p>
    </LegalPage>
  );
}