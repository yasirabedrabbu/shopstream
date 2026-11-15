import type {Metadata} from "next";
import {CustomerShell} from "@/components/customer/shell";
import "../platform/platform.css";
import "./customer.css";
export const metadata:Metadata={title:"Your account",description:"Your ShopStream orders, favorites, shopping bag and profile."};
export default function AccountLayout({children}:{children:React.ReactNode}){return <CustomerShell>{children}</CustomerShell>;}
