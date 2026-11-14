"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Chart } from "@/components/platform/charts";
import { StatTile } from "@/components/platform/ui";
import { taka } from "@/lib/platform/data";
import { formatMoney } from "@/lib/money";
import { useVendorOverview } from "@/lib/workspace/live";
import {
  Action,
  Badge,
  Box,
  Checkbox,
  Panel,
  PlatformLink,
  Screen,
  Text,
  WorkspaceIcon,
} from "./ui";

// Backend fulfilment status -> label the Badge component already styles.
const STATUS_LABEL: Record<string, string> = {
  NEW: "Pending",
  PACKED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

function isoDay(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function weekday(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short" });
}

export function WorkspaceOverview() {
  const router = useRouter();
  const { dashboard, store, newItems, unread, loading, error, reload } = useVendorOverview("30d");
  const [completed, setCompleted] = useState<string[]>([]);

  const now = new Date();
  const todayIso = isoDay(now);
  const yesterdayIso = isoDay(new Date(now.getTime() - 86_400_000));
  const longDate = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const daily = dashboard?.daily ?? [];
  const todayCents = daily.find((d) => d.date === todayIso)?.grossCents ?? 0;
  const yesterdayCents = daily.find((d) => d.date === yesterdayIso)?.grossCents ?? 0;
  const pending = dashboard?.pipeline.NEW ?? 0;
  const lowCount = dashboard?.lowStock.length ?? 0;
  const currency = dashboard?.currency ?? "BDT";
  const netCents = dashboard?.revenue.netCents ?? 0;

  const trendValue = yesterdayCents
    ? ((todayCents - yesterdayCents) / yesterdayCents) * 100
    : 0;
  const trendText = `${Math.abs(trendValue).toFixed(1)}%`;
  const trendDirection: "up" | "down" | "neutral" =
    trendValue > 0 ? "up" : trendValue < 0 ? "down" : "neutral";

  const revenueChart = daily.map((d) => ({
    label: weekday(d.date),
    value: d.grossCents / 100,
  }));
  const revenueTotal = (dashboard?.revenue.grossCents ?? 0) / 100;

  const taskList = [
    {
      id: "orders",
      title: pending
        ? `Confirm ${pending} new ${pending === 1 ? "order" : "orders"}`
        : "Review order activity",
      href: "/vendor/orders",
    },
    {
      id: "stock",
      title: lowCount
        ? `Restock ${lowCount} low-stock ${lowCount === 1 ? "product" : "products"}`
        : "Check stock levels",
      href: "/vendor/products",
    },
  ];
  const remaining = taskList.filter((t) => !completed.includes(t.id));

  const quickActions = [
    {
      name: "Add product",
      description: "Make room for a new favorite",
      icon: "add" as const,
      href: "/vendor/products/new",
    },
    {
      name: "View orders",
      description: "Keep good things moving",
      icon: "receipt" as const,
      href: "/vendor/orders",
    },
    {
      name: "Manage products",
      description: "Update stock, prices and sales",
      icon: "box" as const,
      href: "/vendor/products",
    },
  ];

  const greeting = store?.storeName
    ? `Good ${greetingPart(now)}, ${store.storeName}`
    : `Good ${greetingPart(now)}`;

  return (
    <Screen
      frame="workspace/overview"
      title={greeting}
      subtitle="A little clarity for your day. Here’s how your store is doing."
      actions={
        <Box className="w-date-chip">
          <WorkspaceIcon name="calendar" size={16} />
          <Text variant="small">{longDate}</Text>
        </Box>
      }
      emptyTitle="Your next chapter starts here"
      emptyText="Add a first product and make this workspace your own."
      emptyAction={
        <PlatformLink href="/vendor/products/new" className="p-text-link">
          Add your first product
        </PlatformLink>
      }
    >
      {error && (
        <Box className="p-panel" role="alert">
          <Text tone="danger">{error}</Text>
          <Action onClick={reload}>Try again</Action>
        </Box>
      )}

      {loading && !dashboard && (
        <Text role="status" tone="muted">
          Loading your store…
        </Text>
      )}

      {dashboard && (
        <>
          <Box className="w-welcome-banner">
            <Box>
              <Text variant="eyebrow">Your store, in good hands</Text>
              <Text as="h2" className="w-banner-title">
                Small steps. Good business.
              </Text>
              <Text>
                There are {pending} {pending === 1 ? "order" : "orders"} to confirm and{" "}
                {remaining.length} {remaining.length === 1 ? "task" : "tasks"} on today’s list.
              </Text>
              <Action onClick={() => router.push("/vendor/orders")}>
                Review pending orders
                <WorkspaceIcon name="arrowRight" size={16} />
              </Action>
            </Box>
            <Box className="w-banner-art" aria-hidden="true">
              <Box className="w-art-window">
                <Box className="w-art-dots">
                  <span />
                  <span />
                  <span />
                </Box>
                <Box className="w-art-store">
                  <WorkspaceIcon name="store" size={56} />
                </Box>
                <Box className="w-art-bars">
                  <span />
                  <span />
                  <span />
                </Box>
              </Box>
              <span className="w-art-check">
                <WorkspaceIcon name="check" size={24} />
              </span>
              <span className="w-art-box">
                <WorkspaceIcon name="box" size={32} />
              </span>
            </Box>
          </Box>

          <Box className="p-stats w-overview-stats">
            <PlatformLink href="/vendor/orders" className="w-stat-link">
              <StatTile
                icon="wallet"
                label="Today’s Revenue"
                value={taka(todayCents / 100)}
                trend={trendText}
                trendDirection={trendDirection}
                caption="Confirmed order value · vs. yesterday"
              />
            </PlatformLink>
            <PlatformLink href="/vendor/orders" className="w-stat-link">
              <StatTile
                icon="receipt"
                label="Pending Orders"
                value={String(pending).padStart(2, "0")}
                trend={`${pending} to review`}
                trendDirection="neutral"
                caption="A quick confirmation goes a long way"
              />
            </PlatformLink>
            <PlatformLink href="/vendor/products" className="w-stat-link">
              <StatTile
                icon="box"
                label="Low Stock Items"
                value={String(lowCount).padStart(2, "0")}
                trend="Below 10"
                trendDirection="neutral"
                caption="Including products with zero stock"
              />
            </PlatformLink>
            <Box className="w-stat-link">
              <StatTile
                icon="wallet"
                label="Net Earnings"
                value={formatMoney(netCents, currency)}
                trend={`${dashboard.revenue.orders} orders`}
                trendDirection="neutral"
                caption="After platform commission"
              />
            </Box>
          </Box>

          <Box className="w-overview-grid">
            <Panel
              title="Revenue at a glance"
              subtitle="Confirmed order value · Recent days"
              actions={
                <Text variant="small" className="p-legend-item">
                  <span className="p-legend-dot" />
                  Revenue
                </Text>
              }
            >
              <Box className="p-chart-summary">
                <Box>
                  <Text as="strong" variant="metric">
                    {taka(revenueTotal)}
                  </Text>
                  <Text variant="small" tone="muted">
                    Selected period total
                  </Text>
                </Box>
                <PlatformLink href="/vendor/orders" className="p-text-link">
                  View orders
                  <WorkspaceIcon name="arrowRight" size={14} />
                </PlatformLink>
              </Box>
              {revenueChart.length > 0 ? (
                <Chart label="Store revenue by day" data={revenueChart} money />
              ) : (
                <Text tone="muted">No sales in this period yet.</Text>
              )}
            </Panel>

            <Panel
              title="Today’s focus"
              subtitle="A little structure for a productive day"
              actions={
                <Text className="w-count-pill" variant="small">
                  {remaining.length} tasks
                </Text>
              }
            >
              <Box className="w-task-list">
                {remaining.length ? (
                  remaining.map((task) => (
                    <Box key={task.id} className="w-task">
                      <Checkbox
                        label={`Complete ${task.title}`}
                        checked={false}
                        onChange={() => setCompleted((c) => [...c, task.id])}
                      />
                      <Action
                        variant="ghost"
                        className="w-task-action"
                        onClick={() => router.push(task.href)}
                      >
                        <Box>
                          <Text>{task.title}</Text>
                        </Box>
                        <WorkspaceIcon name="arrowRight" size={14} />
                      </Action>
                    </Box>
                  ))
                ) : (
                  <Box className="w-tasks-done">
                    <WorkspaceIcon name="checkCircle" size={32} />
                    <Text as="h3" variant="heading">
                      A good day’s work.
                    </Text>
                    <Text tone="muted">All tasks are complete.</Text>
                  </Box>
                )}
              </Box>
              <Box className="w-task-footer">
                <Text variant="small" tone="muted">
                  {completed.length} of {taskList.length} completed
                </Text>
                {completed.length > 0 && (
                  <Action variant="ghost" onClick={() => setCompleted([])}>
                    Reset tasks
                  </Action>
                )}
              </Box>
            </Panel>
          </Box>

          <Box className="w-section-heading">
            <Box>
              <Text as="h2" variant="heading">
                Make your next move
              </Text>
              <Text variant="small" tone="muted">
                Your everyday actions, a little closer.
              </Text>
            </Box>
            <Text variant="small" tone="muted">
              Quick actions
            </Text>
          </Box>
          <Box className="w-quick-actions">
            {quickActions.map((action) => (
              <Action
                key={action.name}
                className="w-quick-action"
                onClick={() => router.push(action.href)}
              >
                <span className="w-quick-icon">
                  <WorkspaceIcon name={action.icon} size={24} />
                </span>
                <Box>
                  <Text>{action.name}</Text>
                  <Text variant="small" tone="muted">
                    {action.description}
                  </Text>
                </Box>
                <WorkspaceIcon name="trendUp" size={16} />
              </Action>
            ))}
          </Box>

          <Box className="w-section-heading">
            <Box>
              <Text as="h2" variant="heading">
                Orders that need you
              </Text>
              <Text variant="small" tone="muted">
                A quick look at what’s waiting.
              </Text>
            </Box>
            <PlatformLink href="/vendor/orders" className="p-text-link">
              View all orders
              <WorkspaceIcon name="arrowRight" size={14} />
            </PlatformLink>
          </Box>
          <Box className="w-order-highlights">
            {newItems.slice(0, 3).map((item) => (
              <PlatformLink
                key={item.itemId}
                href="/vendor/orders"
                className="w-order-highlight"
              >
                <Box className="w-space-between">
                  <Text>{item.productName}</Text>
                  <Badge status={STATUS_LABEL[item.fulfillmentStatus] ?? item.fulfillmentStatus} />
                </Box>
                <Text variant="small" tone="muted">
                  {item.shippingAddress.fullName} · Qty {item.quantity}
                </Text>
                <Text className="w-order-value">
                  {formatMoney(item.lineTotalCents, item.currency)}
                </Text>
              </PlatformLink>
            ))}
            {newItems.length === 0 && (
              <Box className="w-order-highlight">
                <Text tone="success">All caught up. No orders awaiting confirmation.</Text>
              </Box>
            )}
          </Box>

          {unread > 0 && (
            <Text variant="small" tone="muted">
              You have {unread} unread {unread === 1 ? "notification" : "notifications"}.
            </Text>
          )}
        </>
      )}
    </Screen>
  );
}

function greetingPart(date: Date): string {
  const h = date.getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}