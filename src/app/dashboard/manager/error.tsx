"use client";
import { RouteErrorState } from "@/components/shared/route-error-state";
export default function ManagerError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      reset={reset}
      title="Manager workspace unavailable"
      description="We couldn’t load the manager workspace."
      primaryHref="/dashboard/manager"
      primaryLabel="Manager dashboard"
      secondaryHref="/"
      secondaryLabel="Home"
    />
  );
}
