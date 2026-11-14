"use client";

import { useState } from "react";
import Link from "next/link";
import { Modal } from "./Modal";
import { Icon } from "./ui/Icon";

const questions = [
  {
    question: "Is this a real shop?",
    answer:
      "You’re exploring a frontend demonstration. Products, prices, stores, and availability are sample content. No real orders or payments are processed.",
  },
  {
    question: "How do I try checkout?",
    answer:
      "Open any available sample product, choose a quantity, and select Preview checkout. Use example details, review the sample totals, then finish the demo. Nothing is saved or sent.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No. Account creation and sign-in are not connected in this preview. You can browse and try guest checkout without providing credentials.",
  },
  {
    question: "What about delivery and returns?",
    answer:
      "The checkout shows an illustrative ৳80 delivery fee and a 3–5 working day estimate. These are not real delivery promises. No goods will be shipped and no return request is needed.",
  },
  {
    question: "Can I open a store?",
    answer:
      "The seller page explains the intended experience. Store registration, inventory, and dashboards need a connected service and are not live in this frontend preview.",
  },
];

export function DemoHelp() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open quick help"
        className="fixed bottom-5 right-4 z-50 flex h-12 items-center gap-2 rounded-full border border-text/10 bg-text px-4 text-bg shadow-lg"
      >
        <Icon name="chat" size={20} />
        <span className="hidden text-xs font-semibold sm:inline">
          Quick help
        </span>
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="A little help, right here"
      >
        <p className="mb-4 text-xs leading-relaxed text-text-muted">
          Quick answers about this demo. No chat messages or personal
          information are collected.
        </p>
        <div className="divide-y divide-border">
          {questions.map((item) => (
            <details key={item.question} className="group py-1">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">
                {item.question}
                <Icon
                  name="chevron"
                  size={15}
                  className="shrink-0 transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="pb-4 text-sm leading-relaxed text-text-muted">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
        <Link
          href="/products"
          onClick={() => setOpen(false)}
          className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline underline-offset-4"
        >
          Explore the collection
          <Icon name="arrowRight" size={14} />
        </Link>
      </Modal>
    </>
  );
}
