import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function AdminSubscriptionPageLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-8 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-72 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <Card className="border-border/70 shadow-none">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-2 w-1/2">
            <div className="h-5 w-36 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-64 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="h-6 w-20 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="rounded-xl border bg-muted/20 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 w-1/2">
                <div className="h-4 w-12 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-6 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
              <div className="size-11 rounded-lg bg-zinc-200 dark:bg-zinc-800 shrink-0" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-16 rounded-lg border bg-zinc-50 dark:bg-zinc-900/50" />
            <div className="h-16 rounded-lg border bg-zinc-50 dark:bg-zinc-900/50" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
            <div className="space-y-1.5 w-1/2">
              <div className="h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-3 w-56 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="h-9 w-28 rounded-md bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-none">
        <CardHeader className="gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2 w-1/2">
              <div className="h-5 w-36 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-60 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="size-5 rounded bg-zinc-200 dark:bg-zinc-800 shrink-0" />
          </div>
          <div className="h-10 w-full rounded-md bg-zinc-200 dark:bg-zinc-800" />
        </CardHeader>

        <CardContent>
          <div className="space-y-3 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-5 w-16 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
                <div className="h-4 w-10 rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}