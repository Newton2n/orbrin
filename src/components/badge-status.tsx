import { Badge } from "@/components/ui/badge";

const styles: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  IN_PROGRESS: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  REVIEW: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  DONE: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  COMPLETED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  PLANNING: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
  TODO: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
  ARCHIVED: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
};
export function StatusBadge({ value }: { value?: string | null }) {
  const label = value?.replaceAll("_", " ") ?? "Unknown";
  return (
    <Badge className={styles[value ?? ""] ?? "bg-muted text-muted-foreground"}>
      {label}
    </Badge>
  );
}
