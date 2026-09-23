"use client";

import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getReadableErrorMessage } from "@/lib/client/error-message";

export function ErrorState({
  title = "Something went wrong",
  description,
  error,
  onRetry,
  retryLabel = "Try again",
  action,
  compact = false,
  className = "",
}: {
  title?: string;
  description?: string;
  error?: unknown;
  onRetry?: () => void;
  retryLabel?: string;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  const message =
    description ??
    getReadableErrorMessage(
      error,
      "We couldn’t load this information. Please try again.",
    );
  const content = (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-center ${compact ? "p-4" : "min-h-32 p-6"} ${className}`}
      role="alert"
    >
      <AlertTriangle className="size-6 text-destructive" aria-hidden="true" />
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        )}
        {action}
      </div>
    </div>
  );
  return compact ? (
    content
  ) : (
    <Card>
      <CardContent className="p-0">{content}</CardContent>
    </Card>
  );
}
