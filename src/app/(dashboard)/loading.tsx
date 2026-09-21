export default function DashboardLoading() {
  return (
    <div className="space-y-6" aria-label="Loading workspace" aria-busy="true">
      <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}
