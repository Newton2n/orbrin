"use client";
import { RouteErrorState } from "@/components/shared/route-error-state";
export default function AdminTeamsError({
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
      primaryHref="/dashboard/admin"
      primaryLabel="Admin dashboard"
    />
  );
}
