"use client";

import { useCallback, useEffect, useState } from "react";

export type CartLine = { slug: string; quantity: number };

const KEY = "shopstream.cart.v1";
const EVENT = "shopstream-cart-change";
export const MAX_QUANTITY = 10;

function read(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (l): l is CartLine =>
          typeof l?.slug === "string" &&
          Number.isInteger(l?.quantity) &&
          l.quantity > 0,
      )
      .map((l) => ({ slug: l.slug, quantity: Math.min(l.quantity, MAX_QUANTITY) }));
  } catch {
    return [];
  }
}

function write(lines: CartLine[]) {
  window.localStorage.setItem(KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event(EVENT));
}

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    const sync = () => setLines(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const add = useCallback((slug: string, quantity = 1) => {
    const current = read();
    const existing = current.find((l) => l.slug === slug);
    const next = existing
      ? current.map((l) =>
          l.slug === slug
            ? { ...l, quantity: Math.min(MAX_QUANTITY, l.quantity + quantity) }
            : l,
        )
      : [...current, { slug, quantity: Math.min(MAX_QUANTITY, quantity) }];
    write(next);
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number) => {
    const current = read();
    const next =
      quantity < 1
        ? current.filter((l) => l.slug !== slug)
        : current.map((l) =>
            l.slug === slug
              ? { ...l, quantity: Math.min(MAX_QUANTITY, quantity) }
              : l,
          );
    write(next);
  }, []);

  const remove = useCallback((slug: string) => {
    write(read().filter((l) => l.slug !== slug));
  }, []);

  const clear = useCallback(() => write([]), []);

  return { lines, add, setQuantity, remove, clear };
}