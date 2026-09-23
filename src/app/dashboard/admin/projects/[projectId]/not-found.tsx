import { NotFoundState } from "@/components/shared/not-found-state";
export default function AdminProjectNotFound() {
  return (
    <NotFoundState
      title="Project not found"
      description="This project may have been removed or is no longer available."
      href="/dashboard/admin/projects"
      label="Back to projects"
    />
  );
}
