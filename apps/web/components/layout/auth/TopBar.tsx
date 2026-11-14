import Link from "next/link";
import { Logo } from "./Logo";
import { AuthIcon } from "@/components/auth/AuthIcon";
export interface TopBarProps {
  id?: string;
}
export function TopBar({ id }: TopBarProps) {
  return (
    <header id={id} className="a-form-top">
      <div className="a-mobile-logo">
        <Logo />
      </div>
      <div className="a-support">
        <span className="p-text p-small p-tone-muted">Need a hand?</span>
        <Link href="/contact" className="p-link a-text-link">
          Get in touch
          <AuthIcon name="arrowRight" className="a-icon-mini" />
        </Link>
      </div>
    </header>
  );
}
