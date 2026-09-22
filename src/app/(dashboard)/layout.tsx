import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "../../actions/auth.action";
import { DashboardShell } from "../../components/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const result = await getCurrentUser();
  if (!result.success || !result.data) redirect("/login");
  return <DashboardShell user={result.data}>{children}</DashboardShell>;
}
