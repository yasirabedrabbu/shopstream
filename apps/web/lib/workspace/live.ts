"use client";

import { useCallback, useEffect, useState } from "react";
import { notificationApi, vendorApi } from "@/lib/api";
import type {
  VendorDashboardResponse,
  VendorOrderItemResponse,
  VendorResponse,
} from "@/lib/types";

export type DashboardPeriod = "7d" | "30d" | "all";

export function useVendorOverview(period: DashboardPeriod = "30d") {
  const [dashboard, setDashboard] = useState<VendorDashboardResponse | null>(null);
  const [store, setStore] = useState<VendorResponse | null>(null);
  const [newItems, setNewItems] = useState<VendorOrderItemResponse[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      vendorApi.dashboard(period),
      vendorApi.store().catch(() => null),
      vendorApi.orderItems(0),
      notificationApi.unreadCount().catch(() => 0),
    ])
      .then(([d, s, items, count]) => {
        if (cancelled) return;
        setDashboard(d);
        setStore(s);
        setNewItems(items.content.filter((i) => i.fulfillmentStatus === "NEW"));
        setUnread(count);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Could not load the overview.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [period, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { dashboard, store, newItems, unread, loading, error, reload };
}