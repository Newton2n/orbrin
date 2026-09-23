"use client";
import { RouteErrorState } from "@/components/shared/route-error-state";
export default function MemberError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      reset={reset}
      title="Member workspace unavailable"
      description="We couldn’t load the member workspace."
      primaryHref="/dashboard/member"
      primaryLabel="Member dashboard"
      secondaryHref="/"
      secondaryLabel="Home"
    />
  );
}
