"use client";

export default function AccountError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div role="alert" className="page-width py-16">
      <h1 className="text-2xl font-semibold">Something went wrong.</h1>
      <p className="mt-2 text-sm text-text-muted">{error.message}</p>
      <button
        onClick={reset}
        className="mt-6 min-h-11 rounded-xl border border-border px-5 text-sm"
      >
        Try again
      </button>
    </div>
  );
}