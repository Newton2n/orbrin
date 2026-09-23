"use client";

import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getReadableErrorMessage } from "@/lib/client/error-message";

export function LoadingState({
  label = "Loading",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-24 items-center justify-center gap-2 text-sm text-muted-foreground ${className}`}
      aria-live="polite"
    >
      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: typeof Inbox;
}) {
  return (
    <Card>
      <CardContent className="flex min-h-40 flex-col items-center justify-center gap-2 p-6 text-center">
        <Icon className="size-8 text-muted-foreground" aria-hidden="true" />
        <h3 className="font-medium">{title}</h3>
        {description && (
          <p className="max-w-md text-sm text-muted-foreground">
            {description}
          </p>
        )}
        {action}
      </CardContent>
    </Card>
  );
}

export function ErrorState({
  message,
  error,
  onRetry,
  title = "Something went wrong",
}: {
  message?: string;
  error?: unknown;
  onRetry?: () => void;
  title?: string;
}) {
  const readable =
    message ??
    getReadableErrorMessage(
      error,
      "We couldn’t load this information. Please try again.",
    );
  return (
    <Card>
      <CardContent
        className="flex min-h-32 flex-col items-center justify-center gap-3 p-6 text-center"
        role="alert"
      >
        <AlertCircle className="size-7 text-destructive" aria-hidden="true" />
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{readable}</p>
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
