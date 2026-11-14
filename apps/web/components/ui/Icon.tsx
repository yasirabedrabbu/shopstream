// apps/web/src/components/ui/Icon.tsx
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  Package01Icon,
  ReceiptIcon,
  Store01Icon,
  UserGroupIcon,
  Tag01Icon,
  Wallet01Icon,
  User02Icon,
  Logout01Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Shield01Icon,
  Alert02Icon,
  Search01Icon,
  ShoppingCart01Icon,
  Cancel01Icon,
  Tick02Icon,
  StarIcon,
  TruckIcon,
  HeartIcon,
  EyeIcon,
  EyeOffIcon,
  Menu01Icon,
  Notification01Icon,
  Loading03Icon,
  InformationCircleIcon,
  CheckmarkCircle02Icon,
  Message01Icon,
  SentIcon,
} from "@hugeicons/core-free-icons";

export type IconName =
  | "dashboard"
  | "box"
  | "receipt"
  | "store"
  | "users"
  | "tag"
  | "wallet"
  | "user"
  | "logout"
  | "chevron"
  | "shield"
  | "alert"
  | "arrowLeft"
  | "arrowRight"
  | "search"
  | "cart"
  | "close"
  | "check"
  | "star"
  | "truck"
  | "heart"
  | "eye"
  | "eyeOff"
  | "menu"
  | "bell"
  | "loading"
  | "info"
  | "checkCircle"
  | "chat"
  | "send";

const icons: Record<IconName, IconSvgElement> = {
  dashboard: DashboardSquare01Icon,
  box: Package01Icon,
  receipt: ReceiptIcon,
  store: Store01Icon,
  users: UserGroupIcon,
  tag: Tag01Icon,
  wallet: Wallet01Icon,
  user: User02Icon,
  logout: Logout01Icon,
  chevron: ArrowDown01Icon,
  shield: Shield01Icon,
  alert: Alert02Icon,
  arrowLeft: ArrowLeft01Icon,
  arrowRight: ArrowRight01Icon,
  search: Search01Icon,
  cart: ShoppingCart01Icon,
  close: Cancel01Icon,
  check: Tick02Icon,
  star: StarIcon,
  truck: TruckIcon,
  heart: HeartIcon,
  eye: EyeIcon,
  eyeOff: EyeOffIcon,
  menu: Menu01Icon,
  bell: Notification01Icon,
  loading: Loading03Icon,
  info: InformationCircleIcon,
  checkCircle: CheckmarkCircle02Icon,
  chat: Message01Icon,
  send: SentIcon,
};

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 18, className = "", strokeWidth = 1.8 }: IconProps) {
  return (
    <HugeiconsIcon
      icon={icons[name]}
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden="true"
      focusable="false"
    />
  );
}