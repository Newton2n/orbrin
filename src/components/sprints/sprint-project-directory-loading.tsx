import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function SprintProjectDirectoryLoading() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card
          key={i}
          className="flex min-w-0 flex-col overflow-hidden border-border/70 shadow-none"
        >
          <CardHeader className="p-4 sm:p-5">
            <div className="flex min-w-0 items-start gap-3">
              <div className="size-9 shrink-0 rounded-lg bg-zinc-200 dark:bg-zinc-800" />

              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-5 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
                
                <div className="space-y-1">
                  <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="mt-auto p-4 pt-0 sm:p-5 sm:pt-0">
            <div className="h-8 w-full rounded-md bg-zinc-200 dark:bg-zinc-800" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}