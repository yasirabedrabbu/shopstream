import { Suspense } from "react";
import { TenantsScreen } from "@/components/platform/tenants";
export default function TenantsPage(){return <Suspense fallback={<p>Loading tenant directory…</p>}><TenantsScreen/></Suspense>;}
