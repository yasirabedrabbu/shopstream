"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { initialActivities, initialSettings, initialTenants, initialUsers, type Activity, type PlatformSettings, type TenantStatus, type Tenant, type PlatformUser } from "@/lib/platform/data";
import type { PlatformTheme } from "@/lib/platform/design";

type Draft = { commission: string; minimumOrder: string; maintenance: boolean };
function usePlatformState() {
  const [theme, setTheme] = useState<PlatformTheme>("dark");
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
  const [users, setUsers] = useState<PlatformUser[]>(initialUsers);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [query, setQuery] = useState("");
  const [rangeDays, setRangeDays] = useState(30);
  const [settings, setSettings] = useState<PlatformSettings>(initialSettings);
  const [draft, setDraft] = useState<Draft>({ commission: "5", minimumOrder: "200", maintenance: false });
  const [notice, setNotice] = useState("");
  const [unread, setUnread] = useState(4);
  const settingsDirty = draft.commission !== String(settings.commission) || draft.minimumOrder !== String(settings.minimumOrder) || draft.maintenance !== settings.maintenance;
  useEffect(() => {
    if (!settingsDirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [settingsDirty]);
  function addActivity(activity: Omit<Activity, "id" | "time">) {
    setActivities(items => [{ ...activity, id: crypto.randomUUID(), time: "Just now" }, ...items]);
    setUnread(value => value + 1);
  }
  function changeTenant(id: string, status: TenantStatus) {
    const tenant = tenants.find(item => item.id === id);
    if (!tenant || tenant.status === status) return;
    setTenants(items => items.map(item => item.id === id ? { ...item, status } : item));
    addActivity({ type: status === "Suspended" ? "suspended" : "approval", title: `${tenant.name} ${status === "Suspended" ? "was suspended" : "was approved"}`, description: "Demo action · This session only", tenantId: id });
  }
  function changeUser(id: string, status: "Active" | "Suspended") {
    if (id === "USR-001") return;
    setUsers(items => items.map(item => item.id === id ? { ...item, status } : item));
  }
  function resetAccess(id: string) {
    if (id === "USR-001") return;
    setUsers(items => items.map(item => item.id === id ? { ...item, resetRequested: true } : item));
  }
  function saveSettings(next: PlatformSettings) {
    setSettings(next);
    setDraft({ commission: String(next.commission), minimumOrder: String(next.minimumOrder), maintenance: next.maintenance });
    addActivity({ type: "settings", title: "Marketplace settings updated", description: "Demo configuration · No production changes" });
    setNotice("Demo settings saved for this session. No production settings were changed.");
  }
  function discardSettings() { setDraft({ commission: String(settings.commission), minimumOrder: String(settings.minimumOrder), maintenance: settings.maintenance }); }
  return { theme, setTheme, tenants, changeTenant, users, changeUser, resetAccess, activities, query, setQuery, rangeDays, setRangeDays, settings, draft, setDraft, settingsDirty, saveSettings, discardSettings, notice, setNotice, unread, markRead: () => setUnread(0) };
}
const PlatformContext = createContext<ReturnType<typeof usePlatformState> | null>(null);
export function PlatformProvider({ children }: { children: ReactNode }) { const state = usePlatformState(); return <PlatformContext.Provider value={state}>{children}</PlatformContext.Provider>; }
export function usePlatform() { const value = useContext(PlatformContext); if (!value) throw new Error("Platform components require PlatformProvider."); return value; }
