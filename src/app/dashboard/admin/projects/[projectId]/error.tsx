"use client";
import { RouteErrorState } from "@/components/shared/route-error-state";
export default function AdminProjectError({
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
      primaryHref="/dashboard/admin/projects"
      primaryLabel="Back to projects"
    />
  );
}
