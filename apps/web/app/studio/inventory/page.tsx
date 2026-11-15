"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { vendorApi } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import type { Page, ProductResponse, ProductStatus } from "@/lib/types";
import { Button, Card, PageHeader, Pill, Segmented, SearchBox, Skeleton } from "@/components/studio/ui";

type StockTab = "all" | "in" | "low";
const LOW = 10;
const PAGE_SIZE = 20;

const STATUS_TONE: Record<ProductStatus, "green" | "stone" | "amber" | "red"> = {
  ACTIVE: "green",
  DRAFT: "amber",
  ARCHIVED: "stone",
  BLOCKED: "red",
};

export default function StudioInventoryPage() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Page<ProductResponse> | null>(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [tab, setTab] = useState<StockTab>("all");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    setError("");
    apiFetchPage(page)
      .then((res) => {
        if (active) setData(res);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Products could not be loaded.");
      });
    return () => {
      active = false;
    };
  }, [page, reloadKey]);

  const products = data?.content ?? [];
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => map.set(p.categoryName, (map.get(p.categoryName) ?? 0) + 1));
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [products]);

  const counts = {
    all: products.length,
    in: products.filter((p) => p.stockQuantity > 0).length,
    low: products.filter((p) => p.stockQuantity > 0 && p.stockQuantity < LOW).length,
  };

  const visible = products.filter((p) => {
    if (tab === "in" && p.stockQuantity <= 0) return false;
    if (tab === "low" && !(p.stockQuantity > 0 && p.stockQuantity < LOW)) return false;
    if (statusFilter.length && !statusFilter.includes(p.status)) return false;
    if (categoryFilter.length && !categoryFilter.includes(p.categoryName)) return false;
    if (query.trim() && !`${p.name} ${p.slug}`.toLowerCase().includes(query.trim().toLowerCase())) return false;
    return true;
  });

  const selected = products.find((p) => p.id === selectedId) ?? visible[0] ?? null;

  function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
  }

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle="Manage products, stock and availability across your store."
        actions={
          <>
            <Button variant="light" onClick={() => setReloadKey((k) => k + 1)}>Refresh</Button>
            <Button variant="accent" onClick={() => (window.location.href = "/vendor/products/new")}>
              New product <span aria-hidden="true">+</span>
            </Button>
          </>
        }
      />

      {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}

      <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_340px]">
        <Card className="h-fit p-5">
          <FilterGroup title="Status">
            {(["ACTIVE", "DRAFT", "ARCHIVED"] as ProductStatus[]).map((s) => (
              <CheckRow
                key={s}
                label={s.charAt(0) + s.slice(1).toLowerCase()}
                checked={statusFilter.includes(s)}
                onChange={() => setStatusFilter((v) => toggle(v, s))}
              />
            ))}
          </FilterGroup>
          <FilterGroup title="Category">
            {categories.length === 0 && <p className="text-xs text-stone-500">No categories on this page.</p>}
            {categories.map(([name, count]) => (
              <CheckRow
                key={name}
                label={name}
                count={count}
                checked={categoryFilter.includes(name)}
                onChange={() => setCategoryFilter((v) => toggle(v, name))}
              />
            ))}
          </FilterGroup>
          <button
            onClick={() => {
              setStatusFilter([]);
              setCategoryFilter([]);
            }}
            className="mt-2 text-xs font-medium text-stone-500 underline underline-offset-4 hover:text-stone-900"
          >
            Clear filters
          </button>
        </Card>

        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Segmented
              label="Stock filter"
              value={tab}
              onChange={setTab}
              options={[
                { value: "all", label: "All", count: counts.all },
                { value: "in", label: "In stock", count: counts.in },
                { value: "low", label: "Low stock", count: counts.low },
              ]}
            />
            <SearchBox label="Search products" value={query} onChange={setQuery} placeholder="Search name or slug" />
          </div>

          {!data && !error && (
            <div role="status" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-72" />)}
            </div>
          )}

          {data && visible.length === 0 && (
            <Card className="p-12 text-center">
              <p className="font-medium">No products match these filters.</p>
              <p className="mt-1 text-sm text-stone-500">Clear a filter or search for something else.</p>
            </Card>
          )}

          {data && visible.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {visible.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  active={selected?.id === p.id}
                  onSelect={() => setSelectedId(p.id)}
                />
              ))}
            </div>
          )}

          {data && data.totalPages > 1 && (
            <nav aria-label="Product pages" className="flex items-center justify-between text-sm">
              <span className="text-stone-500 tabular-nums">
                Page {page + 1} of {data.totalPages} · {data.totalElements} products
              </span>
              <div className="flex gap-2">
                <Button variant="light" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <Button variant="light" disabled={page >= data.totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </nav>
          )}
        </div>

        <DetailPanel
          key={selected?.id ?? "none"}
          product={selected}
          onSaved={(updated) => {
            setNotice(`${updated.name} saved.`);
            setReloadKey((k) => k + 1);
          }}
        />
      </div>
    </>
  );
}

function apiFetchPage(page: number): Promise<Page<ProductResponse>> {
  return vendorApi.products(page);
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-stone-200 py-4 first:pt-0 last:border-0 last:pb-0">
      <p className="mb-3 text-sm font-semibold">{title}</p>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function CheckRow({ label, count, checked, onChange }: { label: string; count?: number; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
      <span className="flex items-center gap-2.5">
        <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-stone-900" />
        {label}
      </span>
      {count !== undefined && <span className="tabular-nums text-xs text-stone-400">{count}</span>}
    </label>
  );
}

function stockLabel(qty: number): { text: string; cls: string } {
  if (qty <= 0) return { text: "Out of stock", cls: "text-red-700" };
  if (qty < LOW) return { text: `Low stock (${qty})`, cls: "text-red-700" };
  return { text: `In stock (${qty})`, cls: "text-emerald-700" };
}

function ProductCard({ product, active, onSelect }: { product: ProductResponse; active: boolean; onSelect: () => void }) {
  const stock = stockLabel(product.stockQuantity);
  const badge = product.flashSaleActive ? { text: "Flash sale", cls: "bg-orange-50 text-orange-800" } : null;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`group relative overflow-hidden rounded-2xl border bg-white text-left transition ${
        active ? "border-stone-900 ring-1 ring-stone-900" : "border-stone-200 hover:border-stone-400"
      }`}
    >
      <div className="relative aspect-[4/3] bg-stone-100">
        {product.imageUrls[0] ? (
          <Image src={product.imageUrls[0]} alt="" fill sizes="(min-width: 1280px) 25vw, 50vw" unoptimized={!product.imageUrls[0].startsWith("/")} className="object-cover transition duration-500 group-hover:scale-[1.02]" />
        ) : (
          <div className="grid h-full place-items-center text-sm text-stone-400">No image</div>
        )}
        {badge && <span className={`absolute left-3 top-3 rounded-lg px-2.5 py-1 text-xs font-medium ${badge.cls}`}>{badge.text}</span>}
        <span className="absolute right-3 top-3">
          <Pill tone={STATUS_TONE[product.status]}>{product.status.charAt(0) + product.status.slice(1).toLowerCase()}</Pill>
        </span>
      </div>
      <div className="p-4">
        <p className="truncate font-medium">{product.name}</p>
        <p className="truncate text-xs text-stone-500">{product.categoryName}</p>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="font-semibold tabular-nums">{formatMoney(product.effectivePriceCents, product.currency)}</span>
          <span className={`text-xs font-medium ${stock.cls}`}>{stock.text}</span>
        </div>
      </div>
    </button>
  );
}

function DetailPanel({ product, onSaved }: { product: ProductResponse | null; onSaved: (p: ProductResponse) => void }) {
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product ? (product.priceCents / 100).toFixed(2) : "");
  const [stock, setStock] = useState(product ? String(product.stockQuantity) : "");
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? "DRAFT");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!product) {
    return (
      <Card className="h-fit p-6 text-center text-sm text-stone-500">
        Select a product to see its details.
      </Card>
    );
  }

  const dirty = name !== product.name || price !== (product.priceCents / 100).toFixed(2) || stock !== String(product.stockQuantity) || status !== product.status;

  async function save() {
    setError("");
    const priceNum = Number(price);
    const stockNum = Number(stock);
    if (!name.trim()) return setError("Enter a product name.");
    if (!Number.isFinite(priceNum) || priceNum <= 0) return setError("Enter a price above 0.");
    if (!Number.isInteger(stockNum) || stockNum < 0) return setError("Stock must be a whole number, 0 or more.");
    setSaving(true);
    try {
      const updated = await vendorApi.updateProduct(product!.id, {
        name: name.trim(),
        description: product!.description ?? undefined,
        priceCents: Math.round(priceNum * 100),
        currency: product!.currency,
        stockQuantity: stockNum,
        categoryId: product!.categoryId,
        status,
        imageUrls: product!.imageUrls,
      });
      onSaved(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The product could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  const stockState = stockLabel(product.stockQuantity);

  return (
    <Card className="flex h-fit flex-col p-5 xl:sticky xl:top-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Product details</h2>
        <span className={`text-xs font-medium ${stockState.cls}`}>{stockState.text}</span>
      </div>

      <div className="relative mt-4 aspect-square overflow-hidden rounded-xl bg-stone-100">
        {product.imageUrls[0] && (
          <Image src={product.imageUrls[0]} alt={product.name} fill sizes="340px" unoptimized={!product.imageUrls[0].startsWith("/")} className="object-cover" />
        )}
      </div>
      <p className="mt-3 text-xs tabular-nums text-stone-500">SKU · {product.slug}</p>

      <div className="mt-5 space-y-4">
        <Field label="Name" value={name} onChange={setName} />
        <div className="grid grid-cols-2 gap-3">
          <Field label={`Price (${product.currency})`} value={price} onChange={setPrice} inputMode="decimal" />
          <Field label="Stock" value={stock} onChange={setStock} inputMode="numeric" />
        </div>
        <div>
          <label htmlFor="detail-status" className="text-xs font-medium text-stone-600">Status</label>
          <select id="detail-status" value={status} onChange={(e) => setStatus(e.target.value as ProductStatus)} className="mt-1.5 h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none focus:border-stone-900">
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          {product.status === "BLOCKED" && <p className="mt-1.5 text-xs text-red-700">Blocked by the platform. You cannot change its status.</p>}
        </div>
      </div>

      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}

      <Button variant="dark" className="mt-6 w-full" disabled={!dirty || saving || product.status === "BLOCKED"} onClick={save}>
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  inputMode?: "decimal" | "numeric";
}) {
  const id = `field-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-stone-600">{label}</label>
      <input
        id={id}
        value={value}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm tabular-nums outline-none focus:border-stone-900"
      />
    </div>
  );
}