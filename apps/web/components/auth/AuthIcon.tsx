import { HugeiconsIcon } from "@hugeicons/react";
import { authIcons, type AuthIconName } from "@/lib/auth/icons";
export interface AuthIconProps {
  name: AuthIconName;
  className?: string;
}
export function AuthIcon({ name, className = "" }: AuthIconProps) {
  return (
    <HugeiconsIcon
      icon={authIcons[name]}
      className={`a-icon ${className}`}
      aria-hidden="true"
      focusable="false"
    />
  );
}
