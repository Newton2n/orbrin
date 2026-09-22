import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: "default" | "warning" | "success";
}) {
  return (
    <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {label}
            </p>
            <p className="mt-2 font-heading text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {value}
            </p>
          </div>
          <div
            className={[
              "grid size-9 place-items-center rounded-md",
              tone === "warning"
                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                : tone === "success"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
            ].join(" ")}
          >
            <Icon className="size-4" />
          </div>
        </div>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          {detail}
        </p>
      </CardContent>
    </Card>
  );
}
