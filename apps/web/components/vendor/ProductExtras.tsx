"use client";

import { useEffect, useState, type FormEvent } from "react";
import { vendorApi, type VariantBody, type VariantItem } from "@/lib/api";
import type { ProductResponse } from "@/lib/types";
import { formatMoney } from "@/lib/money";

const inputClass =
  "mt-1 w-full min-h-11 rounded-xl border border-border bg-transparent px-3 text-text";
const labelClass = "text-sm font-medium text-text";
const primaryBtn =
  "min-h-11 rounded-xl px-5 font-medium bg-[var(--accent)] text-[var(--accent-text)] disabled:opacity-60";
const ghostBtn = "min-h-11 rounded-xl border border-border px-5 font-medium text-text disabled:opacity-60";
const dangerBtn =
  "min-h-11 rounded-xl border border-red-600 px-5 font-medium text-red-600 disabled:opacity-60";
const cardClass = "rounded-2xl border border-border p-5 flex flex-col gap-4";

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function FlashSaleSection({
  productId,
  initial,
}: {
  productId: string;
  initial: ProductResponse;
}) {
  const [product, setProduct] = useState<ProductResponse>(initial);
  const [salePrice, setSalePrice] = useState(
    initial.salePriceCents ? (initial.salePriceCents / 100).toFixed(2) : "",
  );
  const [startsAt, setStartsAt] = useState(toLocalInput(initial.saleStartsAt));
  const [endsAt, setEndsAt] = useState(toLocalInput(initial.saleEndsAt));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const hasSale = product.salePriceCents !== null;
  const statusText = product.flashSaleActive
    ? "Live now"
    : hasSale
      ? "Scheduled or ended"
      : "No flash sale";

  async function save(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    const price = Number(salePrice);
    if (!Number.isFinite(price) || price <= 0) {
      setError("Enter a sale price greater than 0.");
      return;
    }
    if (Math.round(price * 100) >= product.priceCents) {
      setError("Sale price must be lower than the regular price.");
      return;
    }
    if (!startsAt || !endsAt) {
      setError("Choose a start and an end time.");
      return;
    }
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    if (end <= start) {
      setError("The end time must be after the start time.");
      return;
    }

    setBusy(true);
    try {
      const updated = await vendorApi.setFlashSale(productId, {
        salePriceCents: Math.round(price * 100),
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
      });
      setProduct(updated);
      setMessage("Flash sale saved.");
    } catch (err) {
      setError(errorMessage(err, "The flash sale could not be saved."));
    } finally {
      setBusy(false);
    }
  }

  async function clear() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const updated = await vendorApi.clearFlashSale(productId);
      setProduct(updated);
      setSalePrice("");
      setStartsAt("");
      setEndsAt("");
      setMessage("Flash sale removed.");
    } catch (err) {
      setError(errorMessage(err, "The flash sale could not be removed."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="flash-sale-heading" className={cardClass}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="flash-sale-heading" className="text-lg font-semibold text-text">
          Flash sale
        </h2>
        <span className="text-sm text-text-muted">{statusText}</span>
      </div>

      <form onSubmit={save} className="grid gap-4 md:grid-cols-3" noValidate>
        <div>
          <label htmlFor="flash-price" className={labelClass}>
            Sale price (BDT)
          </label>
          <input
            id="flash-price"
            type="number"
            min="1"
            step="0.01"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="flash-start" className={labelClass}>
            Starts at
          </label>
          <input
            id="flash-start"
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="flash-end" className={labelClass}>
            Ends at
          </label>
          <input
            id="flash-end"
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className={inputClass}
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600 md:col-span-3">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="text-sm text-text md:col-span-3">
            {message}
          </p>
        )}

        <div className="flex flex-wrap gap-3 md:col-span-3">
          <button type="submit" disabled={busy} className={primaryBtn}>
            {busy ? "Saving…" : "Save flash sale"}
          </button>
          {hasSale && (
            <button type="button" disabled={busy} onClick={clear} className={dangerBtn}>
              Remove flash sale
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

type VariantDraft = {
  id?: string;
  sku: string;
  options: string;
  delta: string;
  stock: string;
  active: boolean;
};

const EMPTY_DRAFT: VariantDraft = {
  sku: "",
  options: "",
  delta: "0",
  stock: "0",
  active: true,
};

function parseOptions(text: string): Record<string, string> | string {
  const pairs = text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (pairs.length === 0) return "Add at least one option, for example size: M.";
  if (pairs.length > 3) return "Use at most 3 option groups.";

  const out: Record<string, string> = {};
  for (const pair of pairs) {
    const idx = pair.indexOf(":");
    if (idx <= 0) return `"${pair}" must look like name: value.`;
    const key = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    if (!key || !value) return `"${pair}" must look like name: value.`;
    if (key.length > 40 || value.length > 60)
      return "Option names can be 40 characters and values 60 characters at most.";
    out[key] = value;
  }
  return out;
}

function toBody(d: VariantDraft): VariantBody | string {
  const sku = d.sku.trim();
  if (!sku) return "Enter a SKU.";
  if (sku.length > 64 || !/^[A-Za-z0-9._-]+$/.test(sku))
    return "SKU can use letters, digits, dot, underscore and hyphen (64 characters max).";

  const options = parseOptions(d.options);
  if (typeof options === "string") return options;

  const delta = Number(d.delta);
  if (!Number.isFinite(delta)) return "The price change must be a number.";

  const stock = Number(d.stock);
  if (!Number.isInteger(stock) || stock < 0) return "Stock must be a whole number, 0 or more.";

  return {
    sku,
    options,
    priceDeltaCents: Math.round(delta * 100),
    stockQuantity: stock,
    active: d.active,
  };
}

export function VariantsSection({ productId }: { productId: string }) {
  const [items, setItems] = useState<VariantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<VariantDraft>(EMPTY_DRAFT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    vendorApi.variants
      .list(productId)
      .then((v) => {
        if (!cancelled) setItems(v);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err, "Variants could not be loaded."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    const body = toBody(draft);
    if (typeof body === "string") {
      setError(body);
      return;
    }

    setBusy(true);
    try {
      if (draft.id) {
        const updated = await vendorApi.variants.update(productId, draft.id, body);
        setItems((list) => list.map((v) => (v.id === updated.id ? updated : v)));
        setMessage("Variant updated.");
      } else {
        const created = await vendorApi.variants.create(productId, body);
        setItems((list) => [...list, created]);
        setMessage("Variant added.");
      }
      setDraft(EMPTY_DRAFT);
    } catch (err) {
      setError(errorMessage(err, "The variant could not be saved."));
    } finally {
      setBusy(false);
    }
  }

  function startEdit(v: VariantItem) {
    setError("");
    setMessage("");
    setDraft({
      id: v.id,
      sku: v.sku,
      options: Object.entries(v.options)
        .map(([k, val]) => `${k}: ${val}`)
        .join(", "),
      delta: (v.priceDeltaCents / 100).toFixed(2),
      stock: String(v.stockQuantity),
      active: v.active,
    });
  }

  async function remove(v: VariantItem) {
    if (!window.confirm(`Delete variant ${v.sku}?`)) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await vendorApi.variants.remove(productId, v.id);
      setItems((list) => list.filter((x) => x.id !== v.id));
      if (draft.id === v.id) setDraft(EMPTY_DRAFT);
      setMessage("Variant deleted.");
    } catch (err) {
      setError(errorMessage(err, "The variant could not be deleted."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="variants-heading" className={cardClass}>
      <h2 id="variants-heading" className="text-lg font-semibold text-text">
        Variants
      </h2>
      <p className="text-sm text-text-muted">
        Sizes, colours or other options. The price change is added to the product price.
      </p>

      {loading && (
        <p role="status" className="text-text-muted">
          Loading variants…
        </p>
      )}

      {!loading && items.length === 0 && <p className="text-text-muted">No variants yet.</p>}

      {items.length > 0 && (
        <ul className="flex flex-col gap-3">
          {items.map((v) => (
            <li
              key={v.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3"
            >
              <div>
                <p className="font-medium text-text">{v.sku}</p>
                <p className="text-sm text-text-muted">
                  {Object.entries(v.options)
                    .map(([k, val]) => `${k}: ${val}`)
                    .join(" · ")}
                </p>
                <p className="text-sm text-text-muted">
                  {formatMoney(v.priceCents, "BDT")} · {v.stockQuantity} in stock
                  {!v.active && " · Inactive"}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => startEdit(v)} className={ghostBtn}>
                  Edit
                </button>
                <button type="button" disabled={busy} onClick={() => remove(v)} className={dangerBtn}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2" noValidate>
        <h3 className="md:col-span-2 font-medium text-text">
          {draft.id ? "Edit variant" : "Add a variant"}
        </h3>

        <div>
          <label htmlFor="variant-sku" className={labelClass}>
            SKU
          </label>
          <input
            id="variant-sku"
            value={draft.sku}
            maxLength={64}
            onChange={(e) => setDraft({ ...draft, sku: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="variant-options" className={labelClass}>
            Options (name: value, up to 3)
          </label>
          <input
            id="variant-options"
            placeholder="size: M, color: Red"
            value={draft.options}
            onChange={(e) => setDraft({ ...draft, options: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="variant-delta" className={labelClass}>
            Price change (BDT, can be negative)
          </label>
          <input
            id="variant-delta"
            type="number"
            step="0.01"
            value={draft.delta}
            onChange={(e) => setDraft({ ...draft, delta: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="variant-stock" className={labelClass}>
            Stock
          </label>
          <input
            id="variant-stock"
            type="number"
            min="0"
            step="1"
            value={draft.stock}
            onChange={(e) => setDraft({ ...draft, stock: e.target.value })}
            className={inputClass}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-text md:col-span-2">
          <input
            type="checkbox"
            checked={draft.active}
            onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
          />
          Active (shown to customers)
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600 md:col-span-2">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="text-sm text-text md:col-span-2">
            {message}
          </p>
        )}

        <div className="flex flex-wrap gap-3 md:col-span-2">
          <button type="submit" disabled={busy} className={primaryBtn}>
            {busy ? "Saving…" : draft.id ? "Update variant" : "Add variant"}
          </button>
          {draft.id && (
            <button
              type="button"
              onClick={() => {
                setDraft(EMPTY_DRAFT);
                setError("");
                setMessage("");
              }}
              className={ghostBtn}
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>
    </section>
  );
}