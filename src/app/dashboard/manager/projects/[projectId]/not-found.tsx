import { NotFoundState } from "@/components/shared/not-found-state";
export default function ManagerProjectNotFound() {
  return (
    <NotFoundState
      title="Project not found"
      description="This project may have been removed or is no longer available."
      href="/dashboard/manager/projects"
      label="Back to projects"
    />
  );
}
