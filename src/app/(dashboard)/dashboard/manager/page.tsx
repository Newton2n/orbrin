import { getCurrentUser } from "../../../../actions/auth.action";
import { RoleDashboard } from "../../../../components/dashboard/shared/dashboard-content";

export default async function ManagerDashboardPage() {
  const result = await getCurrentUser();
  if (!result.success || !result.data) return null;
  return <RoleDashboard role="MANAGER" user={result.data} />;
}
