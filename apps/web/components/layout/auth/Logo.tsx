import Link from "next/link";
import { AuthIcon } from "@/components/auth/AuthIcon";
export interface LogoProps {
  dark?: boolean;
}
export function Logo({ dark = false }: LogoProps) {
  return (
    <Link href="/" className={`p-link a-logo ${dark ? "a-logo-dark" : ""}`} aria-label="ShopStream home">
      <span className="a-logo-symbol">
        <AuthIcon name="store" className="a-icon-lg" />
      </span>
      <span className="p-text a-logo-name">
        ShopStream<span className="p-text a-logo-dot">.</span>
      </span>
    </Link>
  );
}
