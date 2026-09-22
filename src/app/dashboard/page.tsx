import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth.action";

export default async function DashboardPage() {
  const result = await getCurrentUser();
  if (!result.success || !result.data) redirect("/login");
  const role = result.data.memberships[0]?.role ?? "MEMBER";
  redirect(`/dashboard/${role.toLowerCase()}`);
}

export const dynamic = "force-dynamic";
