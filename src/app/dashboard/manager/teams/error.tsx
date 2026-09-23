"use client";
import { RouteErrorState } from "@/components/shared/route-error-state";
export default function ManagerTeamsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      reset={reset}
      title="Teams unavailable"
      description="We couldn’t load teams."
      primaryHref="/dashboard/manager"
      primaryLabel="Manager dashboard"
    />
  );
}
