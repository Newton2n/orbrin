"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {}, []);
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div>
        <h2 className="font-heading text-xl font-semibold">
          Workspace unavailable
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Something interrupted this view. Try loading it again.
        </p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
