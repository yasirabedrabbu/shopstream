import { RequireAuth } from "@/components/account/RequireAuth";
import { StudioShell } from "@/components/studio/Shell";

export const metadata = { title: { default: "Seller studio", template: "%s · ShopStream Studio" } };

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <StudioShell>{children}</StudioShell>
    </RequireAuth>
  );
}