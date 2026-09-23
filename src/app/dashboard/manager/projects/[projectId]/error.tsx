"use client";
import { RouteErrorState } from "@/components/shared/route-error-state";
export default function ManagerProjectError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      reset={reset}
      title="Project unavailable"
      description="We couldn’t load this project."
      primaryHref="/dashboard/manager/projects"
      primaryLabel="Back to projects"
    />
  );
}
