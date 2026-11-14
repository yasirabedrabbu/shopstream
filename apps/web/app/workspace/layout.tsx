import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/workspace/shell";
import "../platform/platform.css";
import "./workspace.css";
export const metadata: Metadata = { title: "Store workspace", description: "ShopStream tenant workspace. An interactive store management demonstration." };
export default function WorkspaceLayout({children}:{children:React.ReactNode}){return <WorkspaceShell>{children}</WorkspaceShell>;}
