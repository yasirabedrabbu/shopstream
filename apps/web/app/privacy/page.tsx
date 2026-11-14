// apps/web/src/app/privacy/page.tsx
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated={SITE.lastUpdated}>
      <p>
        {SITE.name} collects only the information needed to run the marketplace: your name, email, phone
        number, delivery address and order history. This page explains what we collect, why, and what
        choices you have.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Account details: name, email address, phone number and password (stored as a secure hash).</li>
        <li>Order details: items, delivery address, payment status and order history.</li>
        <li>Help assistant messages: stored for up to 30 days to improve answers. Emails and phone numbers are removed before storage.</li>
        <li>Technical data: basic server logs, such as IP address and request time, used for security.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To create your account, process orders and show order status.</li>
        <li>To contact you about your orders.</li>
        <li>To prevent fraud and abuse.</li>
      </ul>

      <h2>Payments</h2>
      <p>
        Online payments are processed by our payment partner. We do not store your card details on our servers.
      </p>

      <h2>Sharing</h2>
      <p>
        We share your delivery details with the seller and courier who fulfil your order. We do not sell your
        personal information.
      </p>

      <h2>Your choices</h2>
      <p>
        You can ask us to view, correct or delete your account by writing to{" "}
        <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>.
      </p>

      <h2>Contact</h2>
      <p>
        {SITE.name}, {SITE.address}. Email: <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>
      </p>
    </LegalPage>
  );
}