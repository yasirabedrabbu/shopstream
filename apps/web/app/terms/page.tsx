// apps/web/src/app/terms/page.tsx
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated={SITE.lastUpdated}>
      <p>
        These terms apply when you use {SITE.name}. By creating an account or placing an order, you agree to
        them.
      </p>

      <h2>Accounts</h2>
      <ul>
        <li>You must give accurate information and keep your password private.</li>
        <li>You are responsible for activity on your account.</li>
      </ul>

      <h2>Sellers and products</h2>
      <p>
        Sellers are responsible for their products, prices, stock and delivery. {SITE.name} provides the
        platform that connects buyers and sellers.
      </p>

      <h2>Orders and payment</h2>
      <p>
        An order is confirmed after payment or, for cash on delivery, after the seller accepts it. Prices are
        shown in BDT unless stated otherwise.
      </p>

      <h2>Prohibited use</h2>
      <ul>
        <li>Selling illegal, counterfeit or unsafe items.</li>
        <li>Misusing the help assistant or trying to access other accounts.</li>
      </ul>

      <h2>Limits</h2>
      <p>
        The service is provided as is. To the extent allowed by law, {SITE.name} is not liable for indirect
        losses.
      </p>

      <h2>Changes</h2>
      <p>We may update these terms. The date at the top shows the latest version.</p>

      <h2>Contact</h2>
      <p>
        Email: <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>
      </p>
    </LegalPage>
  );
}