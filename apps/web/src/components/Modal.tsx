// apps/web/src/components/Modal.tsx
"use client";

import { useEffect, useRef } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open) el.showModal();
    else el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="w-full max-w-md rounded-2xl p-0 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      style={{ background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <h2 className="text-base font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          {title}
        </h2>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors text-xl leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </dialog>
  );
}