import { Badge } from "@/components/ui/badge";

const styles: Record<string, string> = {
  URGENT: "bg-red-500/10 text-red-700 dark:text-red-300",
  HIGH: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  MEDIUM: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  LOW: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};
export function PriorityBadge({ value }: { value?: string | null }) {
  return (
    <Badge className={styles[value ?? ""] ?? "bg-muted text-muted-foreground"}>
      {value ?? "Unknown"}
    </Badge>
  );
}
