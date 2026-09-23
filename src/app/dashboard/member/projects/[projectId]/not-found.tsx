import { NotFoundState } from "@/components/shared/not-found-state";
export default function MemberProjectNotFound() {
  return (
    <NotFoundState
      title="Project not found"
      description="This project may have been removed or is no longer available."
      href="/dashboard/member/projects"
      label="Back to projects"
    />
  );
}
