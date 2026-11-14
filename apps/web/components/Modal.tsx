// apps/web/src/components/Modal.tsx
"use client";

import { useEffect, useId, useRef } from "react";
import { Icon } from "./ui/Icon";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
    return () => {
      if (open) {
        el.close();
        previouslyFocused?.focus();
      }
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby={titleId}
      onCancel={onClose}
      className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl p-0 shadow-xl backdrop:bg-black/50"
      style={{
        background: "var(--surface)",
        color: "var(--text)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <h2
          id={titleId}
          className="text-base font-semibold"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {title}
        </h2>
        <button
          onClick={onClose}
          type="button"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-text-muted hover:bg-bg hover:text-text"
          aria-label="Close"
        >
          <Icon name="close" size={20} />
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </dialog>
  );
}
