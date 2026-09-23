"use client";
import { RouteErrorState } from "@/components/shared/route-error-state";
export default function ManagerSprintsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      reset={reset}
      title="Sprints unavailable"
      description="We couldn’t load project sprints."
      primaryHref="/dashboard/manager"
      primaryLabel="Manager dashboard"
    />
  );
}
