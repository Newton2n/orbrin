import Link from "next/link";
import { getProjects, type Project } from "@/actions/project.action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardRole } from "./sprint-list";

export async function SprintProjectDirectory({
  role,
}: {
  role: DashboardRole;
}) {
  const result = await getProjects({
    limit: 100,
    sortBy: "updatedAt",
    sortOrder: "desc",
  });
  const projects: Project[] = result.success ? result.data.items : [];
  const prefix =
    role === "ADMIN" ? "admin" : role === "MANAGER" ? "manager" : "member";
  return (
    <Card className="border-border/70 shadow-none">
      <CardHeader>
        <CardTitle>Choose a project</CardTitle>
        <p className="text-sm text-muted-foreground">
          Open a project to view its sprint timeline and delivery goals.
        </p>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No projects are available.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/${prefix}/projects/${project.id}/sprints`}
                className="rounded-lg border p-4 transition-colors hover:bg-muted"
              >
                <p className="font-medium">{project.name}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {project.description || "View project sprints"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
