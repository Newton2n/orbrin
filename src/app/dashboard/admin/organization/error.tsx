"use client";
import { RouteErrorState } from "@/components/shared/route-error-state";
export default function OrganizationError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      reset={reset}
      title="Organization settings unavailable"
      description="We couldn’t load organization settings."
      primaryHref="/dashboard/admin"
      primaryLabel="Admin dashboard"
    />
  );
}
