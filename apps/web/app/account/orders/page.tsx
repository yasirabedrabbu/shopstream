import{DEMO_MODE}from"@/lib/demo";
import{CustomerOrders}from"@/components/customer/orders";
import LegacyOrders from"@/components/customer/legacy/Orders";
export default function Page(){return DEMO_MODE?<CustomerOrders/>:<LegacyOrders/>;}
