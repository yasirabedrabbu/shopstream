import{DEMO_MODE}from"@/lib/demo";
import{CustomerOrderDetail}from"@/components/customer/orders";
import LegacyOrderDetail from"@/components/customer/legacy/OrderDetail";
export default async function Page({params}:{params:Promise<{id:string}>}){const{id}=await params;return DEMO_MODE?<CustomerOrderDetail id={id}/>:<LegacyOrderDetail/>;}
