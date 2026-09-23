"use client";
import { RouteErrorState } from "@/components/shared/route-error-state";
export default function ManagerProjectsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      reset={reset}
      title="Projects unavailable"
      description="We couldn’t load projects."
      primaryHref="/dashboard/manager"
      primaryLabel="Manager dashboard"
    />
  );
}
