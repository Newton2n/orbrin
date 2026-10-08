import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/actions/auth.action";
import { getSubscriptionHistory } from "@/actions/subscription.action";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const result = await getCurrentUser();

  if (!result.success || !result.data) {
    redirect("/login");
  }

  const subscriptionResult = await getSubscriptionHistory();

  
// Get the subscription data if available
  const subscription = subscriptionResult.success
    ? subscriptionResult.data
    : null;

  // Determine if the subscription warning should be shown
  const showSubscriptionWarning =
    !subscriptionResult.success || subscription === null;

  // Determine if the subscription has expired
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