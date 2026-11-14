"use client";

import { useEffect, useState } from "react";
import { apiFetch, vendorApi } from "@/lib/api";
import type {
  FulfillmentStatus,
  Page,
  VendorOrderItemResponse,
} from "@/lib/types";
import { downloadCSV } from "@/lib/platform/export";
import { formatMoney } from "@/lib/money";
import type { Column } from "@/components/platform/ui";
import {
  Action,
  Badge,
  Box,
  DataTable,
  Detail,
  Drawer,
  EmptyState,
  Panel,
  Screen,
  SearchField,
  Text,
  WorkspaceIcon,
} from "./ui";

const PAGE_SIZE = 20;

// DataTable needs a string `id` on every row. The API uses `itemId`, so we add `id` for the table only.
type OrderRow = VendorOrderItemResponse & { id: string };

const STATUS_TABS: { value: FulfillmentStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "NEW", label: "Pending" },
  { value: "PACKED", label: "Packed" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

const LABEL: Record<FulfillmentStatus, string> = {
  NEW: "Pending",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

// Only the moves the backend allows. The server rejects anything else.
const NEXT: Partial<Record<FulfillmentStatus, { to: FulfillmentStatus; label: string }>> = {
  NEW: { to: "PACKED", label: "Mark packed" },
  PACKED: { to: "SHIPPED", label: "Mark shipped" },
  SHIPPED: { to: "DELIVERED", label: "Mark delivered" },
};

function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

function relativeTime(iso: string): string {
  const minutes = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} hr ago`;
  const days = Math.floor(minutes / 1440);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}

function useVendorOrderItems(status: FulfillmentStatus | "ALL") {
  const [data, setData] = useState<Page<VendorOrderItemResponse> | null>(null);
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

    apiFetch<Page<VendorOrderItemResponse>>(`/vendor/orders/items?${qs.toString()}`)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Orders could not be loaded.");
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

export function OrdersScreen() {
  const [status, setStatus] = useState<FulfillmentStatus | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<VendorOrderItemResponse | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  const { data, page, setPage, loading, error, reload } = useVendorOrderItems(status);

  // 1. Filter the current page by the search text.
  const rows: VendorOrderItemResponse[] = (data?.content ?? []).filter((item) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return `${item.orderId} ${item.productName} ${item.shippingAddress.fullName}`
      .toLowerCase()
      .includes(needle);
  });

  // 2. Build table rows from the filtered rows. Must come after `rows`.
  const tableRows: OrderRow[] = rows.map((r) => ({ ...r, id: r.itemId }));

  const totalPages = data?.totalPages ?? 0;

  function changeStatus(value: FulfillmentStatus | "ALL") {
    setStatus(value);
    setPage(0);
  }

  async function advance(item: VendorOrderItemResponse, to: FulfillmentStatus) {
    setBusyId(item.itemId);
    setActionError("");
    setNotice("");
    try {
      await vendorApi.advanceItem(item.itemId, to);
      setNotice(`Order #${shortId(item.orderId)} marked ${LABEL[to].toLowerCase()}.`);
      setDetail(null);
      reload();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "The status could not be updated.",
      );
    } finally {
      setBusyId(null);
    }
  }

  function exportOrders(items: VendorOrderItemResponse[]) {
    downloadCSV("shopstream-orders.csv", [
      ["Order ID", "Item ID", "Product", "Quantity", "Total", "Status", "Placed at", "Customer", "City"],
      ...items.map((i) => [
        i.orderId,
        i.itemId,
        i.productName,
        i.quantity,
        (i.lineTotalCents / 100).toFixed(2),
        LABEL[i.fulfillmentStatus],
        i.placedAt,
        i.shippingAddress.fullName,
        i.shippingAddress.city,
      ]),
    ]);
    setNotice(`${items.length} orders exported.`);
  }

  const columns: Column<OrderRow>[] = [
    {
      key: "id",
      title: "Order ID",
      sortValue: (i) => i.orderId,
      render: (i) => (
        <Action variant="ghost" className="w-order-id" onClick={() => setDetail(i)}>
          #{shortId(i.orderId)}
        </Action>
      ),
    },
    {
      key: "customer",
      title: "Customer",
      sortValue: (i) => i.shippingAddress.fullName,
      render: (i) => (
        <Box>
          <Text>{i.shippingAddress.fullName}</Text>
          <Text variant="small" tone="muted">
            {i.productName} × {i.quantity}
          </Text>
        </Box>
      ),
    },
    {
      key: "total",
      title: "Total",
      sortValue: (i) => i.lineTotalCents,
      render: (i) => formatMoney(i.lineTotalCents, i.currency),
    },
    {
      key: "status",
      title: "Status",
      render: (i) => <Badge status={LABEL[i.fulfillmentStatus]} />,
    },
    {
      key: "date",
      title: "Placed",
      sortValue: (i) => i.placedAt,
      render: (i) => (
        <Text
          variant="small"
          tone="muted"
          title={new Date(i.placedAt).toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })}
        >
          {relativeTime(i.placedAt)}
        </Text>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (i) => {
        const next = NEXT[i.fulfillmentStatus];
        return (
          <Box className="p-row-actions">
            <Action aria-label={`View order ${shortId(i.orderId)}`} onClick={() => setDetail(i)}>
              View
            </Action>
            {next && (
              <Action
                variant="ghost"
                disabled={busyId === i.itemId}
                onClick={() => advance(i, next.to)}
              >
                {next.label}
                <WorkspaceIcon name="arrowRight" size={14} />
              </Action>
            )}
          </Box>
        );
      },
    },
  ];

  const detailNext = detail ? NEXT[detail.fulfillmentStatus] : undefined;

  return (
    <Screen
      frame="workspace/commerce/orders"
      title="Orders"
      subtitle="From first click to happy doorstep. Keep every order moving."
      actions={
        <Action disabled={!rows.length} onClick={() => exportOrders(rows)}>
          Export orders
        </Action>
      }
      emptyTitle="No orders yet"
      emptyText="When customers place their first orders, this is where you’ll manage every step."
      emptyAction={
        <Action
          onClick={() => {
            setQuery("");
            changeStatus("ALL");
          }}
        >
          Show all orders
        </Action>
      }
    >
      {notice && (
        <Text role="status" tone="success">
          {notice}
        </Text>
      )}
      {actionError && (
        <Text role="alert" tone="danger">
          {actionError}
        </Text>
      )}
      {error && (
        <Box className="p-panel" role="alert">
          <Text tone="danger">{error}</Text>
          <Action onClick={reload}>Try again</Action>
        </Box>
      )}

      <Box className="w-tabs" role="group" aria-label="Filter orders by status">
        {STATUS_TABS.map((tab) => (
          <Action
            key={tab.value}
            variant="ghost"
            aria-pressed={status === tab.value}
            onClick={() => changeStatus(tab.value)}
          >
            {tab.label}
          </Action>
        ))}
      </Box>

      <Box className="p-filter-bar">
        <SearchField
          label="Search orders"
          placeholder="Search order, product or customer…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Box>

      {loading && !data ? (
        <Text role="status" tone="muted">
          Loading orders…
        </Text>
      ) : tableRows.length > 0 ? (
        <Panel
          title="Order directory"
          subtitle={`Page ${page + 1} of ${Math.max(totalPages, 1)} · Totals in BDT`}
        >
          <DataTable data={tableRows} columns={columns} label="Orders" empty={<span />} />
        </Panel>
      ) : (
        <Box className="p-panel">
          <EmptyState
            icon="receipt"
            title="No orders here"
            text="Try another status or search term to find an order."
            action={
              <Action
                onClick={() => {
                  setQuery("");
                  changeStatus("ALL");
                }}
              >
                Clear filters
              </Action>
            }
          />
        </Box>
      )}

      {totalPages > 1 && (
        <Box className="w-grid-pagination">
          <Text variant="small" tone="muted">
            Page {page + 1} of {totalPages}
          </Text>
          <Box className="p-pagination">
            <Action disabled={page === 0 || loading} onClick={() => setPage(page - 1)}>
              Previous
            </Action>
            <Action
              disabled={page >= totalPages - 1 || loading}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Action>
          </Box>
        </Box>
      )}

      <Drawer
        open={!!detail}
        title={detail ? `Order #${shortId(detail.orderId)}` : "Order"}
        onClose={() => setDetail(null)}
        actions={
          <>
            <Action onClick={() => setDetail(null)}>Close</Action>
            {detail && detailNext && (
              <Action
                variant="primary"
                disabled={busyId === detail.itemId}
                onClick={() => advance(detail, detailNext.to)}
              >
                {detailNext.label}
              </Action>
            )}
          </>
        }
      >
        {detail && (
          <>
            <Box className="w-space-between">
              <Badge status={LABEL[detail.fulfillmentStatus]} />
              <Text variant="small" tone="muted">
                {relativeTime(detail.placedAt)}
              </Text>
            </Box>

            <Box className="w-drawer-section">
              <Text as="h3" variant="heading">
                Delivery details
              </Text>
              <Box className="w-detail-grid">
                <Detail label="Customer">{detail.shippingAddress.fullName}</Detail>
                <Detail label="Phone">{detail.shippingAddress.phone}</Detail>
              </Box>
              <Detail label="Address">
                {[
                  detail.shippingAddress.line1,
                  detail.shippingAddress.line2,
                  detail.shippingAddress.city,
                  detail.shippingAddress.state,
                  detail.shippingAddress.postalCode,
                  detail.shippingAddress.countryCode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </Detail>
            </Box>

            <Box className="w-drawer-section">
              <Text as="h3" variant="heading">
                Item
              </Text>
              <Box className="w-order-line">
                <Box>
                  <Text>{detail.productName}</Text>
                  <Text variant="small" tone="muted">
                    {detail.quantity} × {formatMoney(detail.unitPriceCents, detail.currency)}
                  </Text>
                </Box>
                <Text>{formatMoney(detail.lineTotalCents, detail.currency)}</Text>
              </Box>
            </Box>

            <Box className="w-drawer-section">
              <Detail label="Placed">
                {new Date(detail.placedAt).toLocaleString("en-GB", {
                  timeZone: "Asia/Dhaka",
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                BST
              </Detail>
              <Text variant="small" tone="muted">
                {detailNext
                  ? "Each step is saved to the server. The customer is notified when the item ships or is delivered."
                  : `This order is ${LABEL[detail.fulfillmentStatus].toLowerCase()}. No further changes are available.`}
              </Text>
            </Box>
          </>
        )}
      </Drawer>
    </Screen>
  );
}