export type TenantStatus = "Active" | "Pending" | "Suspended";
export type TenantPlan = "Starter" | "Growth" | "Business";
export type PlatformRole = "CUSTOMER" | "VENDOR" | "ADMIN" | "PLATFORM_ADMIN";
export type Tenant = { id: string; name: string; slug: string; owner: string; email: string; plan: TenantPlan; status: TenantStatus; orders: number; revenue: number; joined: string; city: string };
export type PlatformUser = { id: string; name: string; email: string; role: PlatformRole; status: "Active" | "Suspended"; lastActive: string; joined: string; resetRequested?: boolean };
export type PlatformSettings = { commission: number; minimumOrder: number; maintenance: boolean };
export type ChartDatum = { label: string; value: number; previous?: number };
export type Activity = { id: string; type: "approval" | "flag" | "signup" | "settings" | "suspended"; title: string; description: string; time: string; tenantId?: string };

export const DEMO_TODAY = "2026-11-30";
export const initialSettings: PlatformSettings = { commission: 5, minimumOrder: 200, maintenance: false };
export const initialTenants: Tenant[] = [
  { id: "TNT-001", name: "Bengal & Thread", slug: "bengal-thread", owner: "Farhan Ahmed", email: "farhan@bengalthread.example", plan: "Business", status: "Active", orders: 1248, revenue: 845200, joined: "2026-03-12", city: "Dhaka" },
  { id: "TNT-002", name: "Nakshi Living", slug: "nakshi-living", owner: "Sabrina Islam", email: "sabrina@nakshi.example", plan: "Growth", status: "Active", orders: 862, revenue: 524800, joined: "2026-07-18", city: "Dhaka" },
  { id: "TNT-003", name: "TechBari", slug: "techbari", owner: "Tanvir Rahman", email: "tanvir@techbari.example", plan: "Business", status: "Active", orders: 1042, revenue: 712400, joined: "2026-05-08", city: "Chattogram" },
  { id: "TNT-004", name: "Mati & Moss", slug: "mati-moss", owner: "Maliha Khan", email: "maliha@matimoss.example", plan: "Growth", status: "Pending", orders: 0, revenue: 0, joined: "2026-11-29", city: "Sylhet" },
  { id: "TNT-005", name: "Book Nook BD", slug: "book-nook", owner: "Rafiul Hasan", email: "rafi@booknook.example", plan: "Starter", status: "Active", orders: 328, revenue: 185600, joined: "2026-10-04", city: "Rajshahi" },
  { id: "TNT-006", name: "Ruposhi Crafts", slug: "ruposhi-crafts", owner: "Nusrat Jahan", email: "nusrat@ruposhi.example", plan: "Starter", status: "Suspended", orders: 146, revenue: 96400, joined: "2026-09-21", city: "Khulna" },
  { id: "TNT-007", name: "Daily Basket", slug: "daily-basket", owner: "Imran Hossain", email: "imran@dailybasket.example", plan: "Growth", status: "Active", orders: 724, revenue: 345800, joined: "2026-08-15", city: "Dhaka" },
  { id: "TNT-008", name: "Clay & Co.", slug: "clay-co", owner: "Ayesha Akter", email: "ayesha@clayco.example", plan: "Growth", status: "Pending", orders: 0, revenue: 0, joined: "2026-11-28", city: "Dhaka" },
  { id: "TNT-009", name: "Nobo Essentials", slug: "nobo", owner: "Sajid Karim", email: "sajid@nobo.example", plan: "Business", status: "Active", orders: 648, revenue: 465200, joined: "2026-06-09", city: "Chattogram" },
  { id: "TNT-010", name: "Sylhet Tea House", slug: "sylhet-tea", owner: "Nabila Noor", email: "nabila@sylhettea.example", plan: "Starter", status: "Active", orders: 214, revenue: 128900, joined: "2026-11-08", city: "Sylhet" },
  { id: "TNT-011", name: "Noor Apothecary", slug: "noor", owner: "Shadman Alam", email: "shadman@noor.example", plan: "Growth", status: "Suspended", orders: 186, revenue: 165400, joined: "2026-10-16", city: "Dhaka" },
  { id: "TNT-012", name: "Homefolk", slug: "homefolk", owner: "Tasnia Rahman", email: "tasnia@homefolk.example", plan: "Starter", status: "Pending", orders: 0, revenue: 0, joined: "2026-11-30", city: "Barishal" },
];
export const initialUsers: PlatformUser[] = [
  { id: "USR-001", name: "Arif Hasan", email: "arif@shopstream.example", role: "PLATFORM_ADMIN", status: "Active", lastActive: "2026-11-30T10:30:00+06:00", joined: "2026-01-01" },
  { id: "USR-002", name: "Nusrat Jahan", email: "nusrat.jahan@example.com", role: "VENDOR", status: "Active", lastActive: "2026-11-30T10:25:00+06:00", joined: "2026-09-21" },
  { id: "USR-003", name: "Rahim Uddin", email: "rahim.uddin@example.com", role: "CUSTOMER", status: "Active", lastActive: "2026-11-30T10:16:00+06:00", joined: "2026-11-24" },
  { id: "USR-004", name: "Sabrina Islam", email: "sabrina.islam@example.com", role: "VENDOR", status: "Active", lastActive: "2026-11-30T09:45:00+06:00", joined: "2026-07-18" },
  { id: "USR-005", name: "Mehedi Hasan", email: "mehedi.hasan@example.com", role: "ADMIN", status: "Active", lastActive: "2026-11-30T09:30:00+06:00", joined: "2026-04-10" },
  { id: "USR-006", name: "Ayesha Akter", email: "ayesha.akter@example.com", role: "CUSTOMER", status: "Suspended", lastActive: "2026-11-26T12:00:00+06:00", joined: "2026-11-12" },
  { id: "USR-007", name: "Tanvir Rahman", email: "tanvir.rahman@example.com", role: "VENDOR", status: "Active", lastActive: "2026-11-29T17:00:00+06:00", joined: "2026-05-08" },
  { id: "USR-008", name: "Maliha Khan", email: "maliha.khan@example.com", role: "VENDOR", status: "Active", lastActive: "2026-11-29T15:20:00+06:00", joined: "2026-11-29" },
  { id: "USR-009", name: "Rafiul Hasan", email: "rafiul.hasan@example.com", role: "CUSTOMER", status: "Active", lastActive: "2026-11-28T14:00:00+06:00", joined: "2026-10-04" },
  { id: "USR-010", name: "Nabila Noor", email: "nabila.noor@example.com", role: "ADMIN", status: "Suspended", lastActive: "2026-11-25T10:00:00+06:00", joined: "2026-06-18" },
  { id: "USR-011", name: "Imran Hossain", email: "imran.hossain@example.com", role: "CUSTOMER", status: "Active", lastActive: "2026-11-29T11:00:00+06:00", joined: "2026-11-20" },
  { id: "USR-012", name: "Tasnia Rahman", email: "tasnia.rahman@example.com", role: "CUSTOMER", status: "Active", lastActive: "2026-11-30T08:00:00+06:00", joined: "2026-11-30" },
];
export const initialActivities: Activity[] = [
  { id: "a1", type: "approval", title: "Bengal & Thread was approved", description: "Business plan · Dhaka", time: "5 min ago", tenantId: "TNT-001" },
  { id: "a2", type: "flag", title: "Order #SS-10842 was flagged", description: "Payment amount needs a review", time: "18 min ago" },
  { id: "a3", type: "signup", title: "Tasnia Rahman joined ShopStream", description: "New customer · Barishal", time: "32 min ago" },
  { id: "a4", type: "signup", title: "Homefolk requested approval", description: "Starter plan · Barishal", time: "48 min ago", tenantId: "TNT-012" },
];
export const monthlyRevenue: ChartDatum[] = [
  { label: "Jan", value: 980400 }, { label: "Feb", value: 1125600 }, { label: "Mar", value: 1289400 }, { label: "Apr", value: 1218000 }, { label: "May", value: 1456800 }, { label: "Jun", value: 1584200 }, { label: "Jul", value: 1745600 }, { label: "Aug", value: 1897600 }, { label: "Sep", value: 2115400 }, { label: "Oct", value: 2204500 }, { label: "Nov", value: 2486500 },
];
export const categoryOrders = [{ label: "Fashion", value: 3542 }, { label: "Electronics", value: 2108 }, { label: "Home & living", value: 1686 }, { label: "Other", value: 1096 }];
export const tenantGrowth: ChartDatum[] = [{label:"Jan",value:520},{label:"Feb",value:578},{label:"Mar",value:642},{label:"Apr",value:695},{label:"May",value:764},{label:"Jun",value:826},{label:"Jul",value:907},{label:"Aug",value:986},{label:"Sep",value:1084},{label:"Oct",value:1176},{label:"Nov",value:1284}];

export function revenueSeries(days: number): ChartDatum[] {
  const length = [7, 30, 90].includes(days) ? days : 30;
  const target = length === 7 ? 642800 : length === 90 ? 6894200 : 2486500;
  const raw = Array.from({ length }, (_, i) => 46000 + i * 1180 + Math.sin(i * 1.28) * 12500 + Math.cos(i * .48) * 7000);
  const sum = raw.reduce((total, value) => total + value, 0);
  const values = raw.map(value => Math.round(value / sum * target));
  values[values.length - 1] += target - values.reduce((total, value) => total + value, 0);
  return values.map((value, i) => ({ label: length === 7 ? `Nov ${24 + i}` : length === 30 ? `Nov ${i + 1}` : `Day ${i + 1}`, value, previous: Math.round(value / 1.185) }));
}
export function filterTenants(tenants: Tenant[], query: string, status = "all", plan = "all", days = 0): Tenant[] {
  const needle = query.toLowerCase().trim();
  const today = Date.parse(`${DEMO_TODAY}T23:59:59+06:00`);
  return tenants.filter(tenant => (!needle || `${tenant.name} ${tenant.owner} ${tenant.email} ${tenant.id}`.toLowerCase().includes(needle)) && (status === "all" || tenant.status === status) && (plan === "all" || tenant.plan === plan) && (!days || today - Date.parse(`${tenant.joined}T00:00:00+06:00`) <= days * 86400000));
}
export function filterUsers(users: PlatformUser[], query: string, role = "all", status = "all") {
  const needle = query.toLowerCase().trim();
  return users.filter(user => (!needle || `${user.name} ${user.email} ${user.id}`.toLowerCase().includes(needle)) && (role === "all" || user.role === role) && (status === "all" || user.status === status));
}
export function taka(value: number) { return `৳${Math.round(value).toLocaleString("en-IN")}`; }
export function compact(value: number) { return value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${(value / 1000).toFixed(value < 10000 ? 1 : 0).replace(/\.0$/, "")}k` : String(Math.round(value)); }
export function initials(name: string) { return name.split(/\s+/).filter(Boolean).slice(0,2).map(part => part[0]).join("").toUpperCase(); }
export function csvString(rows: (string | number)[][]): string {
  return rows.map(row => row.map(value => { const text = String(value); const safe = /^[=+@\-]/.test(text) ? `'${text}` : text; return `"${safe.replaceAll('"','""')}"`; }).join(",")).join("\r\n");
}
export function validateSettings(settings: PlatformSettings) {
  if (!Number.isFinite(settings.commission) || settings.commission < 0 || settings.commission > 100) return "Commission must be between 0 and 100%.";
  if (!Number.isFinite(settings.minimumOrder) || settings.minimumOrder < 0 || settings.minimumOrder > 1000000) return "Minimum order must be between ৳0 and ৳10,00,000.";
  return null;
}
