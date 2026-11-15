// ONE icon system for the whole app: Hugeicons only.
// Add new icons here (import + name + map entry). Never inline <svg> icons in components.
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Add01Icon,
  Alert02Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowReloadHorizontalIcon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  ArrowUpRight01Icon,
  Building03Icon,
  Calendar03Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  ChartLineData01Icon,
  Clock01Icon,
  CreditCardIcon,
  CustomerSupportIcon,
  DashboardSquare01Icon,
  Delete02Icon,
  Download01Icon,
  Edit02Icon,
  EyeIcon,
  FavouriteIcon,
  FilterHorizontalIcon,
  GlobeIcon,
  HelpCircleIcon,
  Home01Icon,
  Image01Icon,
  InformationCircleIcon,
  Loading03Icon,
  Location01Icon,
  LockPasswordIcon,
  Logout01Icon,
  Mail01Icon,
  Megaphone01Icon,
  Menu01Icon,
  Message01Icon,
  MoreVerticalIcon,
  Moon02Icon,
  Notification01Icon,
  Package01Icon,
  ReceiptIcon,
  Search01Icon,
  SentIcon,
  Settings02Icon,
  Shield01Icon,
  ShoppingBag01Icon,
  ShoppingCart01Icon,
  SmartPhone01Icon,
  StarIcon,
  Store01Icon,
  Sun03Icon,
  Tag01Icon,
  Tick02Icon,
  Ticket01Icon,
  TruckIcon,
  User02Icon,
  UserGroupIcon,
  ViewOffIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";

const icons = {
  add: Add01Icon,
  alert: Alert02Icon,
  analytics: ChartLineData01Icon,
  arrowLeft: ArrowLeft01Icon,
  arrowRight: ArrowRight01Icon,
  arrowUp: ArrowUp01Icon,
  arrowUpRight: ArrowUpRight01Icon,
  bag: ShoppingBag01Icon,
  bell: Notification01Icon,
  box: Package01Icon,
  building: Building03Icon,
  calendar: Calendar03Icon,
  card: CreditCardIcon,
  cart: ShoppingCart01Icon,
  chat: Message01Icon,
  check: Tick02Icon,
  checkCircle: CheckmarkCircle02Icon,
  chevron: ArrowDown01Icon,
  clock: Clock01Icon,
  close: Cancel01Icon,
  dashboard: DashboardSquare01Icon,
  delete: Delete02Icon,
  download: Download01Icon,
  edit: Edit02Icon,
  eye: EyeIcon,
  eyeOff: ViewOffIcon,
  filter: FilterHorizontalIcon,
  globe: GlobeIcon,
  heart: FavouriteIcon,
  help: HelpCircleIcon,
  home: Home01Icon,
  image: Image01Icon,
  info: InformationCircleIcon,
  loading: Loading03Icon,
  lock: LockPasswordIcon,
  logout: Logout01Icon,
  mail: Mail01Icon,
  megaphone: Megaphone01Icon,
  menu: Menu01Icon,
  moon: Moon02Icon,
  more: MoreVerticalIcon,
  phone: SmartPhone01Icon,
  pin: Location01Icon,
  receipt: ReceiptIcon,
  refresh: ArrowReloadHorizontalIcon,
  search: Search01Icon,
  send: SentIcon,
  settings: Settings02Icon,
  shield: Shield01Icon,
  star: StarIcon,
  store: Store01Icon,
  sun: Sun03Icon,
  support: CustomerSupportIcon,
  tag: Tag01Icon,
  ticket: Ticket01Icon,
  truck: TruckIcon,
  user: User02Icon,
  users: UserGroupIcon,
  wallet: Wallet01Icon,
} satisfies Record<string, IconSvgElement>;

export type IconName = keyof typeof icons;

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
