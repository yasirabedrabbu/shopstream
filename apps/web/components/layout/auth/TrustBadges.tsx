import { AuthIcon } from "@/components/auth/AuthIcon";
import type { AuthIconName } from "@/lib/auth/icons";
export interface TrustBadgesProps {
  id?: string;
}
const badges: { icon: AuthIconName; label: string }[] = [
  { icon: "shield", label: "Secure" },
  { icon: "pin", label: "Bangladesh-based" },
  { icon: "gift", label: "Free to start" },
];
export function TrustBadges({ id }: TrustBadgesProps) {
  return (
    <div id={id} className="a-trust-badges">
      {badges.map((badge) => (
        <div key={badge.label}>
          <AuthIcon name={badge.icon} className="a-icon-xs" />
          <p className="p-text p-small">{badge.label}</p>
        </div>
      ))}
    </div>
  );
}
