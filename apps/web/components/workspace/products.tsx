"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "@/components/ui/SafeImage";
import {
  apiFetch,
  downloadVendorImportTemplate,
  vendorApi,
  type ImportResultItem,
} from "@/lib/api";
import type { Page, ProductResponse, ProductStatus } from "@/lib/types";
import { formatMoney } from "@/lib/money";
import type { Column } from "@/components/platform/ui";
import { Field } from "@/components/platform/ui";
import {
  Action,
  Badge,
  Box,
  Checkbox,
  DataTable,
  Dialog,
  EmptyState,
  IconButton,
  Panel,
  Screen,
  SearchField,
  SelectField,
  Text,
  WorkspaceIcon,
} from "./ui";

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "DRAFT", label: "Draft" },
  { value: "ARCHIVED", label: "Archived" },
  { value: "BLOCKED", label: "Blocked" },
];

const STATUS_TEXT: Record<string, string> = {
  ACTIVE: "Active",
  DRAFT: "Draft",
  ARCHIVED: "Archived",
  BLOCKED: "Blocked",
};

function useVendorProducts(status: string) {
  const [data, setData] = useState<Page<ProductResponse> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const qs = new URLSearchParams({ page: String(page), size: String(PAGE_SIZE) });
    if (status !== "ALL") qs.set("status", status);

    apiFetch<Page<ProductResponse>>(`/vendor/products?${qs.toString()}`)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Products could not be loaded.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, status, reloadKey]);

  return {
    data,
    page,
    setPage,
    loading,
    error,
    reload: () => setReloadKey((k) => k + 1),
  };
}

export function ProductsScreen() {
  const router = useRouter();
  const [status, setStatus] = useState("ALL");
  const [query, setQuery] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmArchive, setConfirmArchive] = useState<ProductResponse[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [importOpen, setImportOpen] = useState(false);

  const { data, page, setPage, loading, error, reload } = useVendorProducts(status);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (data?.content ?? []).filter(
      (p) =>
        (!needle || `${p.name} ${p.slug}`.toLowerCase().includes(needle)) &&
        (!lowOnly || p.stockQuantity < 10),
    );
  }, [data, query, lowOnly]);

  const selectedRows = (data?.content ?? []).filter((p) => selected.includes(p.id));
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  function changeStatus(value: string) {
    setStatus(value);
    setPage(0);
    setSelected([]);
  }

  async function runBulk(
    items: ProductResponse[],
    action: (p: ProductResponse) => Promise<unknown>,
    doneText: string,
  ) {
    if (items.length === 0) return;
    setBusy(true);
    setNotice("");
    const results = await Promise.allSettled(items.map(action));
    const failed = results.filter((r) => r.status === "rejected").length;
    setBusy(false);
    setSelected([]);
    setNotice(
      failed
        ? `${items.length - failed} ${doneText}, ${failed} failed.`
        : `${items.length} ${doneText}.`,
    );
    reload();
  }

  function setBulkStatus(items: ProductResponse[], next: ProductStatus) {
    // Blocked products are controlled by admin, so the vendor cannot change them.
    const editable = items.filter((p) => p.status !== "BLOCKED");
    return runBulk(
      editable,
      (p) =>
        vendorApi.updateProduct(p.id, {
          name: p.name,
          description: p.description ?? undefined,
          priceCents: p.priceCents,
          currency: p.currency,
          stockQuantity: p.stockQuantity,
          categoryId: p.categoryId,
          status: next,
          imageUrls: p.imageUrls,
        }),
      next === "ACTIVE" ? "published" : "unpublished",
    );
  }

  function archiveSelected(items: ProductResponse[]) {
    return runBulk(items, (p) => vendorApi.deleteProduct(p.id), "archived");
  }

  const columns: Column<ProductResponse>[] = [
    {
      key: "select",
      title: "",
      render: (p) => (
        <Checkbox
          label={`Select ${p.name}`}
          checked={selected.includes(p.id)}
          onChange={(value) =>
            setSelected((s) => (value ? [...s, p.id] : s.filter((id) => id !== p.id)))
          }
        />
      ),
    },
    {
      key: "name",
      title: "Product",
      sortValue: (p) => p.name,
      render: (p) => (
        <Box className="w-table-product">
          {p.imageUrls[0] ? (
            <Image src={p.imageUrls[0]} alt="" width={48} height={48} unoptimized />
          ) : null}
          <Box>
            <Text>{p.name}</Text>
            <Text variant="small" tone="muted">
              {p.categoryName}
            </Text>
          </Box>
        </Box>
      ),
    },
    {
      key: "price",
      title: "Price",
      sortValue: (p) => p.effectivePriceCents,
      render: (p) => (
        <Box>
          <Text className="w-price-small">{formatMoney(p.effectivePriceCents, p.currency)}</Text>
          {p.flashSaleActive && (
            <Text variant="small" tone="accent">
              Flash sale
            </Text>
          )}
        </Box>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (p) => <Badge status={STATUS_TEXT[p.status] ?? p.status} />,
    },
    {
      key: "stock",
      title: "Stock",
      sortValue: (p) => p.stockQuantity,
      render: (p) => (
        <Text tone={p.stockQuantity < 10 ? "danger" : "muted"}>
          {p.stockQuantity} in stock
        </Text>
      ),
    },
    {
      key: "edit",
      title: "Actions",
      render: (p) => (
        <Action
          aria-label={`Edit ${p.name}`}
          onClick={() => router.push(`/vendor/products/${p.id}/edit`)}
        >
          <WorkspaceIcon name="edit" size={16} />
          Edit
        </Action>
      ),
    },
  ];

  const filtersActive = status !== "ALL" || !!query || lowOnly;

  const emptyState = (
    <EmptyState
      title={
        filtersActive
          ? "No products match your filters"
          : "Every good store starts with one product"
      }
      text={
        filtersActive
          ? "Try a different keyword, status, or stock filter."
          : "Add your first product and give your customers something to discover."
      }
      icon="box"
      action={
        filtersActive ? (
          <Action
            onClick={() => {
              setQuery("");
              setLowOnly(false);
              changeStatus("ALL");
            }}
          >
            Clear filters
          </Action>
        ) : (
          <Action variant="primary" onClick={() => router.push("/vendor/products/new")}>
            Add your first product
          </Action>
        )
      }
    />
  );

  return (
    <Screen
      frame="workspace/commerce/products"
      title="Products"
      subtitle="Thoughtful finds. Everyday favorites. Manage your collection here."
      actions={
        <>
          <Action onClick={() => setImportOpen(true)}>
            <WorkspaceIcon name="box" size={16} />
            Import CSV
          </Action>
          <Action variant="primary" onClick={() => router.push("/vendor/products/new")}>
            <WorkspaceIcon name="add" size={18} />
            Add product
          </Action>
        </>
      }
      emptyTitle="Every good store starts with one product"
      emptyText="Let’s add something your customers will love."
      emptyAction={
        <Action variant="primary" onClick={() => router.push("/vendor/products/new")}>
          Add your first product
        </Action>
      }
    >
      {notice && (
        <Text role="status" tone="success">
          {notice}
        </Text>
      )}

      {error && (
        <Box className="p-panel" role="alert">
          <Text tone="danger">{error}</Text>
          <Action onClick={reload}>Try again</Action>
        </Box>
      )}

      <Box className="w-product-toolbar">
        <Box className="p-filter-bar">
          <SearchField
            label="Search products"
            placeholder="Search this page…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <SelectField
            compact
            label="Product status filter"
            value={status}
            onChange={(e) => changeStatus(e.target.value)}
            options={STATUS_OPTIONS}
          />
          <Box className="w-checkbox-label">
            <Checkbox label="Low stock only" checked={lowOnly} onChange={setLowOnly} />
            <Text variant="small">Low stock only</Text>
          </Box>
        </Box>
        <Text variant="small" tone="muted">
          {totalElements} products
        </Text>
      </Box>

      {selectedRows.length > 0 && (
        <Box className="p-bulk">
          <Text>{selectedRows.length} selected</Text>
          <Box className="p-action-row">
            <Action disabled={busy} onClick={() => setBulkStatus(selectedRows, "ACTIVE")}>
              Publish
            </Action>
            <Action disabled={busy} onClick={() => setBulkStatus(selectedRows, "DRAFT")}>
              Unpublish
            </Action>
            <Action variant="danger" disabled={busy} onClick={() => setConfirmArchive(selectedRows)}>
              <WorkspaceIcon name="delete" size={16} />
              Archive
            </Action>
            <Action variant="ghost" onClick={() => setSelected([])}>
              Clear selection
            </Action>
          </Box>
        </Box>
      )}

      {loading && !data ? (
        <Text role="status" tone="muted">
          Loading products…
        </Text>
      ) : rows.length > 0 ? (
        <Panel title="Product collection" subtitle={`Page ${page + 1} of ${Math.max(totalPages, 1)}`}>
          <DataTable data={rows} columns={columns} label="Products" empty={emptyState} />
        </Panel>
      ) : (
        <Box className="p-panel">{emptyState}</Box>
      )}

      {totalPages > 1 && (
        <Box className="w-grid-pagination">
          <Text variant="small" tone="muted">
            Page {page + 1} of {totalPages}
          </Text>
          <Box className="p-pagination">
            <IconButton
              icon="arrowLeft"
              label="Previous products page"
              disabled={page === 0 || loading}
              onClick={() => {
                setPage(page - 1);
                setSelected([]);
              }}
            />
            <IconButton
              icon="arrowRight"
              label="Next products page"
              disabled={page >= totalPages - 1 || loading}
              onClick={() => {
                setPage(page + 1);
                setSelected([]);
              }}
            />
          </Box>
        </Box>
      )}

      <Dialog
        open={!!confirmArchive}
        title="Archive selected products?"
        onClose={() => setConfirmArchive(null)}
        actions={
          <>
            <Action onClick={() => setConfirmArchive(null)}>Cancel</Action>
            <Action
              variant="danger"
              disabled={busy}
              onClick={() => {
                const items = confirmArchive ?? [];
                setConfirmArchive(null);
                archiveSelected(items);
              }}
            >
              Archive {confirmArchive?.length} products
            </Action>
          </>
        }
      >
        <Text>Archived products are hidden from your storefront.</Text>
        <Box className="w-confirm-note">
          {confirmArchive?.map((p) => (
            <Text key={p.id} variant="small">
              {p.name}
            </Text>
          ))}
        </Box>
      </Dialog>

      <Dialog open={importOpen} title="Import products from CSV" onClose={() => setImportOpen(false)}>
        <ImportPanel
          onClose={() => {
            setImportOpen(false);
            reload();
          }}
        />
      </Dialog>
    </Screen>
  );
}

function ImportPanel({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportResultItem | null>(null);
  const [error, setError] = useState("");

  async function upload() {
    if (!file) return;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      setResult(await vendorApi.importProducts(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "The import could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  async function template() {
    setError("");
    try {
      await downloadVendorImportTemplate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "The template could not be downloaded.");
    }
  }

  return (
    <Box className="w-form-stack">
      <Text variant="small" tone="muted">
        Use the template so the column names match. Each row becomes one product.
      </Text>
      <Action onClick={template}>Download template</Action>
      <Field
        label="CSV file"
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => {
          setFile(e.target.files?.[0] ?? null);
          setResult(null);
        }}
      />
      {error && (
        <Text tone="danger" role="alert">
          {error}
        </Text>
      )}
      {result && (
        <Box className="w-confirm-note">
          <Text>
            {result.created} created, {result.failed} failed, out of {result.total} rows.
          </Text>
          {result.errors.slice(0, 10).map((err) => (
            <Text key={`${err.row}-${err.message}`} variant="small" tone="danger">
              Row {err.row}: {err.message}
            </Text>
          ))}
        </Box>
      )}
      <Box className="w-form-footer">
        <Action onClick={onClose}>Close</Action>
        <Action variant="primary" disabled={!file || busy} onClick={upload}>
          {busy ? "Importing…" : "Import"}
        </Action>
      </Box>
    </Box>
  );
}