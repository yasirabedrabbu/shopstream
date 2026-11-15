import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/workspace/shell";
import "../platform/platform.css";
import "./workspace.css";
export const metadata: Metadata = { title: "Store workspace", description: "ShopStream seller workspace for managing your store." };
export default function WorkspaceLayout({children}:{children:React.ReactNode}){return <WorkspaceShell>{children}</WorkspaceShell>;}
