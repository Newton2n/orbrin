"use client";
import { RouteErrorState } from "@/components/shared/route-error-state";
export default function RootError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState reset={reset} primaryHref="/" primaryLabel="Return home" />
  );
}
