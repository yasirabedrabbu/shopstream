import { redirect } from "next/navigation";

export default function AccountOverview(): never {
  redirect("/account/orders");
}