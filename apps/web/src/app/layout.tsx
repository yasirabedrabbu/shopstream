// apps/web/src/app/layout.tsx
import type { Metadata } from "next";
import { Sora, Manrope } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { AssistantWidget } from "@/components/AssistantWidget";

const sora = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ShopStream",
  description: "Multi-vendor e-commerce with live inventory",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sora.variable} ${manrope.variable}`} suppressHydrationWarning>
      {/* suppressHydrationWarning on body: browser extensions (Grammarly etc.) add attributes to body */}
      <body suppressHydrationWarning>
        <ToastProvider>
          {children}
          <AssistantWidget />
        </ToastProvider>
      </body>
    </html>
  );
}