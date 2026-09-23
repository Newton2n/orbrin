"use client";
import { RouteErrorState } from "@/components/shared/route-error-state";
export default function MemberProjectError({
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
      primaryHref="/dashboard/member/projects"
      primaryLabel="Back to projects"
    />
  );
}
