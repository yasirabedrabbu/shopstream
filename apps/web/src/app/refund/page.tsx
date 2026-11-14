// apps/web/src/app/refund/page.tsx
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Refund Policy" };

// Draft: [X] er jaygay apnar real din sonkha / policy boshan. Launch er age zoroor check korben.
export default function RefundPage() {
  return (
    <LegalPage title="Refund Policy" updated={SITE.lastUpdated}>
      <p>
        If something went wrong with your order, this page explains how to ask for a refund or a replacement.
        Each seller sets the exact return rules on their product, and this policy applies on top of them.
      </p>

      <h2>When you can ask for a refund</h2>
      <ul>
        <li>The product is damaged, wrong or not as described.</li>
        <li>The order was not delivered.</li>
        <li>You were charged twice.</li>
      </ul>

      <h2>How to ask</h2>
      <p>
        Contact us within [X] days of delivery with your order number and photos if the item is damaged. Email{" "}
        <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> or message us on{" "}
        <a href={SITE.supportWhatsApp} target="_blank" rel="noopener noreferrer">WhatsApp</a>.
      </p>

      <h2>How refunds are paid</h2>
      <p>
        Approved refunds for online payments go back to the original payment method within [X] working days.
        Cash on delivery orders are refunded by bank transfer or bKash once bank details are confirmed.
      </p>

      <h2>Non refundable cases</h2>
      <ul>
        <li>Items used or damaged after delivery by the buyer.</li>
        <li>Requests made after the return window.</li>
      </ul>
    </LegalPage>
  );
}