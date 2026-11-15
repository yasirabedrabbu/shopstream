import { redirect } from "next/navigation";

// Campaigns need backend API. Until it is live, send users to the overview.
export default function CampaignsPage(): never {
  redirect("/workspace/overview");
}