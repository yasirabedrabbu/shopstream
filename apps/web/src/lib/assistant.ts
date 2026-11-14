// apps/web/src/lib/assistant.ts
import { apiFetch } from "./api";
import type { OrderStatus } from "./types";

export type AssistantAudience = "CUSTOMER" | "VENDOR";

export interface AssistantAnswer {
  type: "ANSWER" | "HANDOFF";
  answer: string;
  link: string | null;
  suggestions: string[];
  handoffUrl: string | null;
}

export interface AssistantOrder {
  orderCode: string;
  status: OrderStatus;
  currency: string;
  totalCents: number;
  createdAt: string;
}

export const assistantApi = {
  // Public endpoint. auth: false so a stale token never blocks an anonymous question.
  message: (message: string, audience: AssistantAudience) =>
    apiFetch<AssistantAnswer>("/assistant/message", {
      method: "POST",
      body: { message, audience },
      auth: false,
    }),

  // Logged in customer only. Returns the 5 most recent orders.
  myOrders: () => apiFetch<AssistantOrder[]>("/assistant/orders"),
};