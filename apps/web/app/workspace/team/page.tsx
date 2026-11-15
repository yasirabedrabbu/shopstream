import { redirect } from "next/navigation";

// Team management needs backend API. Until it is live, send users to the overview.
export default function TeamPage(): never {
  redirect("/workspace/overview");
}