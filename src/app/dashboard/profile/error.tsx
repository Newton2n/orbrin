"use client";
import { RouteErrorState } from "@/components/shared/route-error-state";
export default function ProfileError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      reset={reset}
      title="Profile unavailable"
      description="We couldn’t load your profile."
      primaryHref="/dashboard"
      primaryLabel="Dashboard"
    />
  );
}
