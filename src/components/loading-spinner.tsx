export function LoadingSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <output
      aria-live="polite"
      className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground"
    >
      <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      <span>{label}</span>
    </output>
  );
}
