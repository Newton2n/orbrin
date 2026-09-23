export function getReadableErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (typeof error === "string" && error.trim()) return error;
  if (!error || typeof error !== "object") return fallback;
  const source = error as Record<string, unknown>;
  const status = Number(source.status ?? source.statusCode);
  if (status === 400 || status === 422)
    return "Please review the information and try again.";
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403)
    return "You do not have permission to perform this action.";
  if (status === 404) return "The requested item could not be found.";
  if (status === 409) return "This item conflicts with an existing record.";
  if (status === 413) return "The selected file is too large.";
  if (status === 429)
    return "Too many requests. Please wait a moment and try again.";
  if (status >= 500)
    return "Something went wrong on our side. Please try again shortly.";
  const message = source.message;
  if (typeof message === "string" && message.trim() && message.length < 240)
    return message;
  return fallback;
}
