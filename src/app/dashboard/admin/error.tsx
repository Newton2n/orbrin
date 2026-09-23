"use client";
import { RouteErrorState } from "@/components/shared/route-error-state";
export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      reset={reset}
      title="Admin workspace unavailable"
      description="We couldn’t load the admin workspace."
      primaryHref="/dashboard/admin"
      primaryLabel="Admin dashboard"
      secondaryHref="/"
      secondaryLabel="Home"
    />
  );
}
