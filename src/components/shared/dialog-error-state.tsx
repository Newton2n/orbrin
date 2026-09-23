"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "./error-state";

export function DialogErrorState({
  message,
  onRetry,
  onClose,
}: {
  message?: string | null;
  onRetry: () => void;
  onClose: () => void;
}) {
  return (
    <div className="space-y-3">
      <ErrorState
        compact
        description={
          message ?? "We couldn’t load this information. Please try again."
        }
        onRetry={onRetry}
      />
      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
