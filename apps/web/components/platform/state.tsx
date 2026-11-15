"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { adminApi } from "@/lib/api";
import {
  initialSettings,
  type Activity,
  type PlatformRole,
  type PlatformSettings,
  type PlatformUser,
  type Tenant,
  type TenantStatus,
} from "@/lib/platform/data";
import type { PlatformTheme } from "@/lib/platform/design";
import type { AdminUserResponse, Page, VendorResponse, VendorStatus } from "@/lib/types";

type Draft = { commission: string; minimumOrder: string; maintenance: boolean };

const VENDOR_TO_TENANT: Record<string, TenantStatus> = {
  APPROVED: "Active",
  PENDING: "Pending",
  SUSPENDED: "Suspended",
  REJECTED: "Suspended",
};

const TENANT_TO_VENDOR: Record<TenantStatus, VendorStatus> = {
  Active: "APPROVED" as VendorStatus,
  Pending: "PENDING" as VendorStatus,
  Suspended: "SUSPENDED" as VendorStatus,
};

function toTenant(v: VendorResponse): Tenant {
  return {
    id: v.id,
    name: v.storeName,
    slug: v.slug,
    owner: v.ownerUserId.slice(0, 8),
    email: "—",
    plan: "Starter",
    status: VENDOR_TO_TENANT[v.status] ?? "Pending",
    orders: 0,
    revenue: 0,
    joined: v.createdAt.slice(0, 10),
    city: "—",
  };
}

function toUser(u: AdminUserResponse): PlatformUser {
  const role = (["CUSTOMER", "VENDOR", "ADMIN"].includes(u.role) ? u.role : "CUSTOMER") as PlatformRole;
  return {
    id: u.id,
    name: u.fullName,
    email: u.email,
    role,
    status: String(u.status) === "ACTIVE" ? "Active" : "Suspended",
    lastActive: u.createdAt.slice(0, 10),
    joined: u.createdAt.slice(0, 10),
  };
}

// Loads every page of a paginated admin list, up to a safe limit.
async function loadAll<T>(load: (page: number) => Promise<Page<T>>): Promise<T[]> {
  const out: T[] = [];
  let page = 0;
  let totalPages = 1;
  while (page < totalPages && page < 20) {
    const res = await load(page);
    out.push(...res.content);
    totalPages = res.totalPages;
    page += 1;
  }
  return out;
}

function errorText(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

function usePlatformState() {
  const [theme, setTheme] = useState<PlatformTheme>("dark");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [query, setQuery] = useState("");
  const [rangeDays, setRangeDays] = useState(30);
  const [settings, setSettings] = useState<PlatformSettings>(initialSettings);
  const [draft, setDraft] = useState<Draft>({
    commission: String(initialSettings.commission),
    minimumOrder: String(initialSettings.minimumOrder),
    maintenance: initialSettings.maintenance,
  });
  const [notice, setNotice] = useState("");
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const settingsDirty =
    draft.commission !== String(settings.commission) ||
    draft.minimumOrder !== String(settings.minimumOrder) ||
    draft.maintenance !== settings.maintenance;

  useEffect(() => {
    if (!settingsDirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [settingsDirty]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    Promise.all([
      loadAll((page) => adminApi.vendors(page)),
      loadAll((page) => adminApi.users(page)),
    ])
      .then(([vendors, users]) => {
        if (cancelled) return;
        setTenants(vendors.map(toTenant));
        setUsers(users.map(toUser));
      })
      .catch((err) => {
        if (!cancelled) setError(errorText(err, "Platform data could not be loaded."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function addActivity(activity: Omit<Activity, "id" | "time">) {
    setActivities((items) => [{ ...activity, id: crypto.randomUUID(), time: "Just now" } as Activity, ...items]);
    setUnread((value) => value + 1);
  }

  async function changeTenant(id: string, status: TenantStatus) {
    const tenant = tenants.find((item) => item.id === id);
    if (!tenant || tenant.status === status) return;
    const previous = tenants;
    setTenants((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));
    try {
      await adminApi.updateVendorStatus(id, TENANT_TO_VENDOR[status]);
      addActivity({
        type: status === "Suspended" ? "suspended" : "approval",
        title: `${tenant.name} ${status === "Suspended" ? "was suspended" : "was updated to " + status.toLowerCase()}`,
        description: "Saved to the server",
        tenantId: id,
      } as Omit<Activity, "id" | "time">);
    } catch (err) {
      setTenants(previous);
      setNotice(errorText(err, "The seller status could not be changed."));
    }
  }

  async function changeUser(id: string, status: "Active" | "Suspended") {
    const previous = users;
    setUsers((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));
    try {
      await adminApi.updateUserStatus(id, (status === "Active" ? "ACTIVE" : "SUSPENDED") as never);
    } catch (err) {
      setUsers(previous);
      setNotice(errorText(err, "The user status could not be changed."));
    }
  }

  function resetAccess() {
    setNotice("Sending password reset links from the admin panel is not connected yet.");
  }

  function saveSettings(next: PlatformSettings) {
    setSettings(next);
    setDraft({
      commission: String(next.commission),
      minimumOrder: String(next.minimumOrder),
      maintenance: next.maintenance,
    });
    setNotice("Settings were kept on this screen only. Server-side platform settings are not connected yet.");
  }

  function discardSettings() {
    setDraft({
      commission: String(settings.commission),
      minimumOrder: String(settings.minimumOrder),
      maintenance: settings.maintenance,
    });
  }

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return {
    theme,
    setTheme,
    tenants,
    changeTenant,
    users,
    changeUser,
    resetAccess,
    activities,
    query,
    setQuery,
    rangeDays,
    setRangeDays,
    settings,
    draft,
    setDraft,
    settingsDirty,
    saveSettings,
    discardSettings,
    notice,
    setNotice,
    unread,
    markRead: () => setUnread(0),
    loading,
    error,
    reload,
  };
}

const PlatformContext = createContext<ReturnType<typeof usePlatformState> | null>(null);

export function PlatformProvider({ children }: { children: ReactNode }) {
  const state = usePlatformState();
  return <PlatformContext.Provider value={state}>{children}</PlatformContext.Provider>;
}

export function usePlatform() {
  const value = useContext(PlatformContext);
  if (!value) throw new Error("Platform components require PlatformProvider.");
  return value;
}