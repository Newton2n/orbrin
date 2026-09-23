"use client";
import { RouteErrorState } from "@/components/shared/route-error-state";
export default function MembersError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      reset={reset}
      title="Members unavailable"
      description="We couldn’t load organization members."
      primaryHref="/dashboard/admin"
      primaryLabel="Admin dashboard"
    />
  );
}
