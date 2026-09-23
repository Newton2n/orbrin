import { Skeleton } from "@/components/ui/skeleton";

export function PageHeaderSkeleton() {
  return <div className="flex flex-col gap-3"><Skeleton className="h-3 w-20" /><Skeleton className="h-9 w-56 max-w-full" /><Skeleton className="h-4 w-80 max-w-full" /></div>;
}

export function TableSkeleton({ rows = 6, columns = 4 }: { rows?: number; columns?: number }) {
  return <div className="overflow-hidden rounded-xl border border-border bg-card" aria-busy="true"><div className="grid gap-4 border-b border-border p-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>{Array.from({ length: columns }).map((_, i) => <Skeleton key={i} className="h-4 w-20 max-w-full" />)}</div><div className="flex flex-col divide-y divide-border">{Array.from({ length: rows }).map((_, row) => <div key={row} className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>{Array.from({ length: columns }).map((_, column) => <Skeleton key={column} className="h-4 w-full max-w-40" />)}</div>)}</div></div>;
}

export function DashboardOverviewSkeleton() {
  return <div className="flex flex-col gap-6" aria-busy="true"><PageHeaderSkeleton /><div className="grid gap-4 sm:grid-cols-3">{[1,2,3].map((item) => <Skeleton key={item} className="h-28 rounded-xl" />)}</div><Skeleton className="h-72 rounded-xl" /><TableSkeleton rows={4} columns={3} /></div>;
}

export function ProjectListSkeleton() { return <div className="flex flex-col gap-6" aria-busy="true"><PageHeaderSkeleton /><div className="flex flex-col gap-3 sm:flex-row"><Skeleton className="h-10 w-full sm:max-w-xs" /><Skeleton className="h-10 w-28" /></div><TableSkeleton rows={5} columns={4} /></div>; }
export function TeamListSkeleton() { return <div className="flex flex-col gap-6" aria-busy="true"><PageHeaderSkeleton /><Skeleton className="h-10 w-full sm:max-w-xs" /><TableSkeleton rows={5} columns={3} /></div>; }
export function SprintListSkeleton() { return <div className="flex flex-col gap-6" aria-busy="true"><PageHeaderSkeleton /><div className="flex gap-2"><Skeleton className="h-9 w-20" /><Skeleton className="h-9 w-20" /><Skeleton className="h-9 w-20" /></div><TableSkeleton rows={5} columns={4} /></div>; }
export function TaskListSkeleton() { return <div className="flex flex-col gap-6" aria-busy="true"><PageHeaderSkeleton /><div className="flex flex-col gap-3 sm:flex-row"><Skeleton className="h-10 w-full sm:max-w-xs" /><Skeleton className="h-10 w-28" /></div><TableSkeleton rows={6} columns={5} /></div>; }
export function DetailPageSkeleton() { return <div className="flex flex-col gap-6" aria-busy="true"><PageHeaderSkeleton /><div className="grid gap-4 lg:grid-cols-[1fr_280px]"><Skeleton className="h-96 rounded-xl" /><Skeleton className="h-64 rounded-xl" /></div></div>; }
export function ProfileSkeleton() { return <div className="flex flex-col gap-6" aria-busy="true"><PageHeaderSkeleton /><div className="flex items-center gap-4"><Skeleton className="size-20 rounded-full" /><div className="flex flex-col gap-2"><Skeleton className="h-5 w-40" /><Skeleton className="h-4 w-56" /></div></div><TableSkeleton rows={4} columns={2} /></div>; }
export function OrganizationSkeleton() { return <div className="flex flex-col gap-6" aria-busy="true"><PageHeaderSkeleton /><Skeleton className="h-40 rounded-xl" /><TableSkeleton rows={5} columns={3} /></div>; }
export function AuthSkeleton() { return <div className="mx-auto flex min-h-[60vh] w-full max-w-md items-center justify-center px-6"><div className="flex w-full flex-col gap-4 rounded-2xl border border-border bg-card p-6"><Skeleton className="mx-auto h-8 w-32" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div></div>; }

export function DashboardShellSkeleton() { return <div className="flex min-h-svh" aria-busy="true"><aside className="hidden w-64 border-r border-border p-5 lg:block"><Skeleton className="h-8 w-32" /><div className="mt-10 flex flex-col gap-3">{[1,2,3,4,5].map((item) => <Skeleton key={item} className="h-9 w-full" />)}</div></aside><main className="flex min-w-0 flex-1 flex-col"><div className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-8"><Skeleton className="h-8 w-32" /><Skeleton className="size-9 rounded-full" /></div><div className="flex flex-1 flex-col gap-6 p-4 sm:p-8"><DashboardOverviewSkeleton /></div></main></div>; }
