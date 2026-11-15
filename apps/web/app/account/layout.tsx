import type { Metadata } from "next";
import "../platform/platform.css";
import "./customer.css";

export const metadata: Metadata = {
  title: "Your account",
  description: "Your ShopStream orders, favorites, shopping bag and profile.",
};

// Account pages render their own frame (see components/account/AccountFrame.tsx).
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}