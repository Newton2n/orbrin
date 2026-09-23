import { TableSkeleton } from "@/components/shared/skeletons";
export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-9 w-48 animate-pulse rounded-md bg-muted" />
      <TableSkeleton rows={6} columns={4} />
    </div>
  );
}
