import type { Metadata } from "next";
import { PlatformShell } from "@/components/platform/shell";
import "./platform.css";
export const metadata: Metadata = { title: { default: "Platform overview · ShopStream", template: "%s · ShopStream Platform" }, description: "ShopStream platform administration demo. Sample marketplace data; no live administrative access." };
export default function PlatformLayout({ children }: { children: React.ReactNode }) { return <PlatformShell>{children}</PlatformShell>; }
