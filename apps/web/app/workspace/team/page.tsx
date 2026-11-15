import { redirect } from "next/navigation";

export default function TeamPage(): never {
  redirect("/workspace/overview");
}