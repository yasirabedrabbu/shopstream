// apps/web/src/app/layout.tsx
import type { Metadata } from "next";
import { Sora, Manrope, Noto_Sans_Bengali } from "next/font/google";
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

// Bangla glyph er jonno. Latin text Sora/Manrope theke ashbe, Bangla text ei font theke.
const bengali = Noto_Sans_Bengali({
  variable: "--font-bengali",
  subsets: ["bengali"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "ShopStream — Good finds. Great little stores.",
    template: "%s · ShopStream",
  },
  description:
    "Discover everyday favorites from independent stores across Bangladesh. Explore the ShopStream frontend demo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${manrope.variable} ${bengali.variable}`}
      suppressHydrationWarning
    >
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
