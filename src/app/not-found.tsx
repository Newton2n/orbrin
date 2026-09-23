import { NotFoundState } from "@/components/shared/not-found-state";

export default function NotFound() {
  return (
    <NotFoundState
      title="Page not found"
      description="This page may have been removed or is no longer available."
      href="/"
      label="Return home"
    />
  );
}
