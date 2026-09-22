import { getCurrentUser } from "../../../../actions/auth.action";
import { RoleDashboard } from "../../../../components/dashboard-content";

export default async function AdminDashboardPage() {
  const result = await getCurrentUser();
  if (!result.success || !result.data) return null;
  return <RoleDashboard role="ADMIN" user={result.data} />;
}
