"use client";

import { RouteErrorState } from "@/components/shared/route-error-state";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteErrorState reset={reset} title="Workspace unavailable" description="Something interrupted this workspace view. Try again or return to the dashboard." />;
}
