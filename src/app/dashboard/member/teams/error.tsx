"use client";
import { RouteErrorState } from "@/components/shared/route-error-state";
export default function MemberTeamsError({
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
      primaryHref="/dashboard/member"
      primaryLabel="Member dashboard"
    />
  );
}
