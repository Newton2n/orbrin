import { CircleAlert } from "lucide-react";

export function InlineError({
  message,
  className = "",
}: {
  message?: string | null;
  className?: string;
}) {
  if (!message) return null;
  return (
    <p
      className={`flex items-center gap-1.5 text-xs text-destructive ${className}`}
      role="alert"
    >
      <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}
