import { Badge } from "@/components/ui/badge";
const styles: Record<string, string> = {
  URGENT: "border-destructive/30 bg-destructive/10 text-destructive",
  HIGH: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  MEDIUM:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  LOW: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};
export function PriorityBadge({ value }: { value?: string | null }) {
  const key = value?.toUpperCase() ?? "";
  return (
    <Badge className={styles[key] ?? "bg-muted text-muted-foreground"}>
      {key || "Unknown"}
    </Badge>
  );
}
