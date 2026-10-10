import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { getCurrentUser } from "@/actions/auth.action";
import { DashboardShellSkeleton } from "@/components/shared/skeletons";
import { getSubscriptionHistory } from "@/actions/subscription.action";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardShellSkeleton />}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}

async function DashboardLayoutContent({ children }: { children: ReactNode }) {
  const result = await getCurrentUser();

  if (!result.success || !result.data) {
    redirect("/login");
  }

  const subscriptionResult = await getSubscriptionHistory();

  
  const subscription = subscriptionResult.success
    ? subscriptionResult.data
    : null;

  const showSubscriptionWarning =
    !subscriptionResult.success || subscription === null;

  const subscriptionExpired =
    subscription !== null &&
    subscription.currentPeriodEnd !== null &&
    new Date(subscription.currentPeriodEnd) < new Date();

  return (
    <DashboardShell
      user={result.data}
      showSubscriptionWarning={showSubscriptionWarning}
      subscriptionExpired={subscriptionExpired}
    >
      {children}
    </DashboardShell>
  );
}