"use client";
import { RouteErrorState } from "@/components/shared/route-error-state";
export default function SubscriptionError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      reset={reset}
      title="Subscription unavailable"
      description="We couldn’t load subscription information."
      primaryHref="/dashboard/admin"
      primaryLabel="Admin dashboard"
    />
  );
}
