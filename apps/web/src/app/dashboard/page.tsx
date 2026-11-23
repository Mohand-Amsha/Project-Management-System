import { redirect } from "next/navigation";

// Old bare dashboard. The app shell lives under (dashboard), so send people there.
export default function LegacyDashboardRedirect() {
  redirect("/projects");
}
