import { Suspense } from "react";
import { TenantsScreen } from "@/components/platform/tenants";

export default function PlatformTenantsPage() {
  return (
    <Suspense fallback={null}>
      <TenantsScreen />
    </Suspense>
  );
}