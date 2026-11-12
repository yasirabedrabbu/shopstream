// apps/web/src/lib/money.ts

export function formatMoney(cents: number, currency = "BDT"): string {
  const amount = cents / 100;

  if (currency === "BDT") {
    return "৳" + amount.toLocaleString("en-BD", { minimumFractionDigits: 0 });
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}