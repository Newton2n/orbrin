import { getCurrentUser } from "@/actions/auth.action";
import { RoleDashboard } from "@/components/dashboard/shared/dashboard-content";

export default async function AdminDashboardPage() {
  const result = await getCurrentUser();
  if (!result.success || !result.data) return null;
  console.log("AdminDashboardPage user:", result.data);
  return <RoleDashboard role="ADMIN" user={result.data} />;
}
