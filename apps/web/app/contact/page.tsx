// apps/web/src/app/contact/page.tsx
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site";
import { buttonClasses } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <LegalPage title="Contact us" updated={SITE.lastUpdated}>
      <p>
        Questions about an order, a product or selling on {SITE.name}? Reach us on WhatsApp for the fastest
        reply, or send an email.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={SITE.supportWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses({ variant: "primary", size: "lg" })}
        >
          Chat on WhatsApp
        </a>
        <a href={`mailto:${SITE.supportEmail}`} className={buttonClasses({ variant: "secondary", size: "lg" })}>
          Email support
        </a>
      </div>

      <h2>Office</h2>
      <p>{SITE.address}</p>

      <h2>Support hours</h2>
      <p>Saturday to Thursday, 10:00 to 18:00 (Bangladesh time). We reply within one working day.</p>
    </LegalPage>
  );
}