"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "shopstream.wishlist.v1";
const EVENT = "shopstream-wishlist-change";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((s): s is string => typeof s === "string")
      : [];
  } catch {
    return [];
  }
}

function write(slugs: string[]) {
  window.localStorage.setItem(KEY, JSON.stringify(slugs));
  window.dispatchEvent(new Event(EVENT));
}

export function useWishlist() {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setSlugs(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((slug: string) => {
    const current = read();
    write(
      current.includes(slug)
        ? current.filter((s) => s !== slug)
        : [...current, slug],
    );
  }, []);

  const remove = useCallback((slug: string) => {
    write(read().filter((s) => s !== slug));
  }, []);

  return {
    slugs,
    has: (slug: string) => slugs.includes(slug),
    toggle,
    remove,
  };
}