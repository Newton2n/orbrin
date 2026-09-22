import { getCurrentUser } from "../../../../actions/auth.action";
import { RoleDashboard } from "../../../../components/dashboard/shared/dashboard-content";

export default async function MemberDashboardPage() {
  const result = await getCurrentUser();
  if (!result.success || !result.data) return null;
  return <RoleDashboard role="MEMBER" user={result.data} />;
}
