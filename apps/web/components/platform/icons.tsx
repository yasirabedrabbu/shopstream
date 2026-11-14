import { HugeiconsIcon } from "@hugeicons/react";
import { Settings01Icon, Analytics01Icon, Download01Icon, Calendar03Icon, Moon02Icon, Sun03Icon, ArrowUpRight01Icon, ArrowDownRight01Icon, Database01Icon, Globe02Icon, HelpCircleIcon, CommandIcon } from "@hugeicons/core-free-icons";
import { Icon, type IconName } from "@/components/ui/Icon";

const extraIcons = { settings: Settings01Icon, analytics: Analytics01Icon, download: Download01Icon, calendar: Calendar03Icon, moon: Moon02Icon, sun: Sun03Icon, trendUp: ArrowUpRight01Icon, trendDown: ArrowDownRight01Icon, database: Database01Icon, globe: Globe02Icon, help: HelpCircleIcon, command: CommandIcon };
export type PlatformIconName = IconName | keyof typeof extraIcons;
export function PlatformIcon({ name, size = 20, className = "" }: { name: PlatformIconName; size?: number; className?: string }) {
  if (name in extraIcons) return <HugeiconsIcon icon={extraIcons[name as keyof typeof extraIcons]} size={size} strokeWidth={1.7} aria-hidden="true" focusable="false" className={className} />;
  return <Icon name={name as IconName} size={size} strokeWidth={1.7} className={className} />;
}
