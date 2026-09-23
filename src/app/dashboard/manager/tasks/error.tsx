"use client";
import { RouteErrorState } from "@/components/shared/route-error-state";
export default function ManagerTasksError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      reset={reset}
      title="Tasks unavailable"
      description="We couldn’t load tasks."
      primaryHref="/dashboard/manager"
      primaryLabel="Manager dashboard"
    />
  );
}
