import { ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function TaskPageLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ClipboardList className="size-5 text-muted-foreground/50" />
            <div className="h-7 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="h-4 w-72 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* Refresh button skeleton */}
        <div className="h-9 w-24 rounded-md bg-zinc-200 dark:bg-zinc-800" />
      </div>

      {/* Task Cards List Skeleton */}
      <div className="grid gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/70 shadow-none">
            <CardContent className="p-4 sm:p-5">
              <div className="space-y-3">
                {/* Title & Badge row */}
                <div className="flex items-center justify-between">
                  <div className="h-5 w-2/5 rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-5 w-16 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                </div>
                {/* Description row */}
                <div className="space-y-1.5">
                  <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
                </div>
                {/* Footer metadata row */}
                <div className="flex items-center justify-between pt-2">
                  <div className="h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Footer Skeleton */}
      <div className="flex items-center justify-between border-t pt-4">
        <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}