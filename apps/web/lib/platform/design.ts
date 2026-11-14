export type PlatformTheme = "dark" | "light";

// Brand values live only in this token source. UI styles consume variable aliases.
export const platformColors = {
  dark: {
    bg: "#0a0a0b", surface: "#111114", border: "#1e1e24", text: "#f1f1f3",
    "text-muted": "#6b7280", "text-muted-readable": "#9299a6",
    accent: "#e8f44a", "accent-text": "#111114", danger: "#ef4444", success: "#22c55e",
    "chart-secondary": "#9299a6", "chart-tertiary": "#bbc0ca", "chart-quaternary": "#657044",
  },
  light: {
    bg: "#f8f9fa", surface: "#ffffff", border: "#e5e7eb", text: "#111114",
    "text-muted": "#6b7280", "text-muted-readable": "#626976",
    accent: "#e8f44a", "accent-text": "#111114", danger: "#ef4444", success: "#22c55e",
    "chart-secondary": "#6b7280", "chart-tertiary": "#a9aeb9", "chart-quaternary": "#657044",
  },
} as const;

export const platformSpacing = [4, 8, 12, 16, 24, 32, 48, 64, 72, 80, 96, 100] as const;
export const platformFontSizes = [12, 14, 16, 20, 24, 32, 40, 44, 48, 56] as const;
export const platformFrames = ["platform/overview", "platform/tenants", "platform/users", "platform/reports", "platform/settings"] as const;

export const platformComponentLibrary = {
  StatTile: { variants: { trend: ["up", "down", "neutral"] }, value: "Sora / 32 / 700", label: "Manrope / 14 / 400" },
  DataTable: { variants: { state: ["default", "empty"], selection: ["none", "partial", "all"], sort: ["ascending", "descending"] }, features: ["sticky header", "row hover", "checkbox selection", "pagination", "sortable columns"] },
  StatusBadge: { variants: { status: ["Active", "Pending", "Suspended"] } },
  RoleBadge: { variants: { role: ["CUSTOMER", "VENDOR", "ADMIN", "PLATFORM_ADMIN"] } },
  PageHeader: { title: "Sora / 24 / 600", subtitle: "Manrope / 14 / 400", slots: ["title", "subtitle", "actions"] },
  EmptyState: { slots: ["icon", "heading", "subtext", "optional action"] },
  SidebarItem: { variants: { state: ["default", "hover", "active"], layout: ["expanded", "collapsed", "bottom navigation"] } },
  Button: { variants: { variant: ["primary", "secondary", "ghost", "danger"], state: ["default", "hover", "focus", "disabled"] }, minimumHeight: 48 },
  Switch: { variants: { checked: [true, false] }, minimumHeight: 48 },
  Chart: { variants: { type: ["line", "bar", "donut"], compare: [true, false] }, accessibility: ["text summary", "equivalent data table"] },
} as const;

export const platformDesignSpec = {
  name: "ShopStream / Platform Super Admin", version: "1.0.0",
  format: "Implementation and Figma variable-import specification; not a native .fig file",
  frames: platformFrames.map(name => ({ name, route: `/${name}`, desktop: { width: 1440, height: 1100 }, tablet: { width: 1024 }, mobile: { width: 390 }, modes: ["Dark", "Light"] })),
  variables: {
    collection: "ShopStream / Platform", modes: ["Dark", "Light"],
    colors: Object.keys(platformColors.dark).map(name => ({ name: `color/${name}`, type: "COLOR", valuesByMode: { Dark: platformColors.dark[name as keyof typeof platformColors.dark], Light: platformColors.light[name as keyof typeof platformColors.light] } })),
    spacing: platformSpacing.map(value => ({ name: `spacing/${value}`, type: "FLOAT", value })),
    radii: { "radius-control": 12, "radius-card": 16, "radius-pill": 999 },
    dimensions: { "sidebar-expanded": 240, "sidebar-collapsed": 80, "topbar": 80, "bottom-nav": 80, "control-min": 48 },
  },
  typography: { heading: { family: "Sora", weights: [600, 700] }, body: { family: "Manrope", weights: [400, 500] }, scale: platformFontSizes },
  components: platformComponentLibrary,
  accessibility: { textContrast: "4.5:1 minimum", note: "The exact brand text-muted token is retained. Use text-muted-readable for dark-mode text. Semantic light-mode text uses stronger aliases, not the raw success/danger fills." },
  behavior: "Frontend-only demonstration. Administrative actions and settings last for this tab's mounted session. No authentication, email, payment, or server mutations are performed.",
};

export function platformTokenStyle(theme: PlatformTheme): Record<string, string> {
  const colors = Object.fromEntries(Object.entries(platformColors[theme]).map(([name, value]) => [`--p-${name}`, value]));
  const spaces = Object.fromEntries(platformSpacing.map(value => [`--p-space-${value}`, `${value}px`]));
  const fonts = Object.fromEntries(platformFontSizes.map(value => [`--p-font-${value}`, `${value}px`]));
  return { ...colors, ...spaces, ...fonts };
}
