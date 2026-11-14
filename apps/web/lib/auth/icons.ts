import { Store01Icon } from "@hugeicons/core-free-icons";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { Shield01Icon } from "@hugeicons/core-free-icons";
import { Location01Icon } from "@hugeicons/core-free-icons";
import { GiftIcon } from "@hugeicons/core-free-icons";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { Download01Icon } from "@hugeicons/core-free-icons";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { ViewIcon } from "@hugeicons/core-free-icons";
import { ViewOffSlashIcon } from "@hugeicons/core-free-icons";
import { Alert02Icon } from "@hugeicons/core-free-icons";
import { Briefcase01Icon } from "@hugeicons/core-free-icons";
import { Mail01Icon } from "@hugeicons/core-free-icons";
import { LockPasswordIcon } from "@hugeicons/core-free-icons";
import { UserIcon } from "@hugeicons/core-free-icons";
import { Loading03Icon } from "@hugeicons/core-free-icons";
export const authIcons = {
  store: Store01Icon,
  check: Tick02Icon,
  checkCircle: CheckmarkCircle02Icon,
  shield: Shield01Icon,
  pin: Location01Icon,
  gift: GiftIcon,
  trendUp: ArrowUpRight01Icon,
  arrowRight: ArrowRight01Icon,
  arrowLeft: ArrowLeft01Icon,
  download: Download01Icon,
  info: InformationCircleIcon,
  eye: ViewIcon,
  eyeOff: ViewOffSlashIcon,
  alert: Alert02Icon,
  briefcase: Briefcase01Icon,
  mail: Mail01Icon,
  password: LockPasswordIcon,
  user: UserIcon,
  loading: Loading03Icon,
};
export type AuthIconName = keyof typeof authIcons;
