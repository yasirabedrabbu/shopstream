// apps/web/src/components/AssistantWidget.tsx
"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ApiError } from "@/lib/api";
import {
  assistantApi,
  type AssistantAnswer,
  type AssistantAudience,
  type AssistantOrder,
} from "@/lib/assistant";
import { getUser, isLoggedIn } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { Icon } from "@/components/ui/Icon";
import { Button, buttonClasses } from "@/components/ui/Button";

type ChatMessage =
  | { id: number; role: "user"; text: string }
  | {
      id: number;
      role: "bot";
      text: string;
      link?: string | null;
      suggestions?: string[];
      handoffUrl?: string | null;
    }
  | { id: number; role: "orders"; orders: AssistantOrder[] };

const ORDER_PATTERN = /order|status|অর্ডার|স্ট্যাটাস/i;

const STATUS_LABEL: Record<AssistantOrder["status"], string> = {
  PENDING: "Pending",
  AWAITING_PAYMENT: "Awaiting payment",
  PAID: "Paid",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

const CUSTOMER_STARTERS = ["Order status", "How do I create an account?", "How do I pay?", "How do I talk to support?"];
const VENDOR_STARTERS = ["How do I add a product?", "What does the dashboard show?", "How do I become a seller?"];

function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}

function formatOrderDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [audience, setAudience] = useState<AssistantAudience>("CUSTOMER");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const nextId = useRef(1);
  const greeted = useRef(false);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelId = useId();
  const titleId = useId();

  function add(make: (id: number) => ChatMessage) {
    const id = nextId.current++;
    setMessages((m) => [...m, make(id)]);
  }

  // First open: pick the audience from the saved user and greet once.
  useEffect(() => {
    if (!open) return;
    const aud: AssistantAudience = getUser()?.role === "VENDOR" ? "VENDOR" : "CUSTOMER";
    setAudience(aud);

    if (!greeted.current) {
      greeted.current = true;
      add((id) => ({
        id,
        role: "bot",
        text:
          aud === "VENDOR"
            ? "Hi! Ask me how to add products, read your dashboard or get approved as a seller. You can write in Bangla or English."
            : "Hi! Ask me about your orders, payment or delivery. You can write in Bangla or English.",
      }));
    }
    inputRef.current?.focus();
    // add() is stable in behaviour; the greeting must run only once per open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Escape closes the panel.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Keep the newest message in view.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function showOrders() {
    if (!isLoggedIn()) {
      add((id) => ({ id, role: "bot", text: "Please sign in to see your orders.", link: "/auth/login" }));
      return;
    }
    setBusy(true);
    try {
      const orders = await assistantApi.myOrders();
      add((id) => ({ id, role: "orders", orders }));
    } catch {
      add((id) => ({
        id,
        role: "bot",
        text: "I could not load your orders. Please sign in again.",
        link: "/auth/login",
      }));
    } finally {
      setBusy(false);
    }
  }

  async function send(raw: string) {
    const text = raw.trim();
    if (text.length < 2 || busy) return;
    setInput("");
    add((id) => ({ id, role: "user", text }));

    if (audience === "CUSTOMER" && ORDER_PATTERN.test(text)) {
      await showOrders();
      return;
    }

    setBusy(true);
    try {
      const res: AssistantAnswer = await assistantApi.message(text, audience);
      add((id) => ({
        id,
        role: "bot",
        text: res.answer,
        link: res.link,
        suggestions: res.suggestions,
        handoffUrl: res.handoffUrl,
      }));
    } catch (err) {
      const rateLimited = err instanceof ApiError && err.status === 429;
      add((id) => ({
        id,
        role: "bot",
        text: rateLimited
          ? "You are sending messages quickly. Please wait a minute and try again."
          : "I could not answer right now. Please try again in a moment.",
      }));
    } finally {
      setBusy(false);
    }
  }

  const starters = audience === "VENDOR" ? VENDOR_STARTERS : CUSTOMER_STARTERS;
  const showStarters = messages.length <= 1;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close help assistant" : "Open help assistant"}
        className="fixed bottom-20 right-4 z-50 grid h-14 w-14 place-items-center rounded-full bg-accent text-accent-text shadow-[var(--shadow-lift)] transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus)] md:bottom-6 md:right-6"
      >
        <Icon name={open ? "close" : "chat"} size={24} />
      </button>

      {open && (
        <section
          id={panelId}
          role="dialog"
          aria-labelledby={titleId}
          className="fixed inset-x-2 bottom-20 top-20 z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-bg shadow-[var(--shadow-lift)] md:inset-x-auto md:bottom-24 md:right-6 md:top-auto md:h-[600px] md:w-[380px]"
        >
          <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div>
              <h2 id={titleId} className="text-sm font-semibold text-text">
                ShopStream help
              </h2>
              <p className="text-xs text-text-muted">{audience === "VENDOR" ? "Seller help" : "Bangla or English"}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="grid h-11 w-11 place-items-center rounded-full text-text-muted transition-colors hover:bg-surface hover:text-text focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus)]"
            >
              <Icon name="close" size={18} />
            </button>
          </header>

          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
          >
            {messages.map((m) => {
              if (m.role === "user") {
                return (
                  <div key={m.id} className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-accent px-3.5 py-2.5 text-sm text-accent-text">
                    {m.text}
                  </div>
                );
              }

              if (m.role === "orders") {
                return (
                  <div key={m.id} className="mr-auto w-full max-w-[95%] rounded-2xl rounded-bl-md bg-surface px-3.5 py-3">
                    {m.orders.length === 0 ? (
                      <p className="text-sm text-text">You have no orders yet.</p>
                    ) : (
                      <ul className="flex flex-col divide-y divide-border">
                        {m.orders.map((o) => (
                          <li key={o.orderCode} className="flex items-center justify-between gap-3 py-2 text-sm">
                            <div className="min-w-0">
                              <p className="font-semibold text-text">#{o.orderCode}</p>
                              <p className="text-xs text-text-muted">{formatOrderDate(o.createdAt)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-text">{STATUS_LABEL[o.status]}</p>
                              <p className="text-xs text-text-muted">{formatMoney(o.totalCents, o.currency)}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link href="/account/orders" className="mt-2 inline-flex min-h-9 items-center text-xs font-semibold text-text underline-offset-4 hover:underline">
                      Open My orders
                    </Link>
                  </div>
                );
              }

              return (
                <div key={m.id} className="mr-auto flex max-w-[90%] flex-col gap-2">
                  <div className="whitespace-pre-line rounded-2xl rounded-bl-md bg-surface px-3.5 py-2.5 text-sm text-text">
                    {m.text}
                  </div>

                  {m.link &&
                    (isExternal(m.link) ? (
                      <a href={m.link} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: "secondary", size: "sm", className: "w-fit" })}>
                        Open
                      </a>
                    ) : (
                      <Link href={m.link} className={buttonClasses({ variant: "secondary", size: "sm", className: "w-fit" })}>
                        Open page
                      </Link>
                    ))}

                  {m.handoffUrl && (
                    <a href={m.handoffUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: "primary", size: "sm", className: "w-fit" })}>
                      Chat on WhatsApp
                    </a>
                  )}

                  {m.suggestions && m.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {m.suggestions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          disabled={busy}
                          onClick={() => void send(s)}
                          className="min-h-9 rounded-full border border-border px-3 py-1.5 text-xs text-text transition-colors hover:border-text/40 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus)]"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {showStarters && (
              <div className="mt-1 flex flex-wrap gap-2">
                {starters.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={busy}
                    onClick={() => void send(s)}
                    className="min-h-9 rounded-full border border-border px-3 py-1.5 text-xs text-text transition-colors hover:border-text/40 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus)]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question"
              aria-label="Type your question"
              maxLength={500}
              className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-bg px-3.5 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-4 focus:ring-[var(--focus)]"
            />
            <Button type="submit" size="md" disabled={busy || input.trim().length < 2} aria-label="Send">
              <Icon name="send" size={18} />
            </Button>
          </form>
        </section>
      )}
    </>
  );
}