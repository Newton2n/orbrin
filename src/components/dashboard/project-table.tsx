import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export interface DashboardProject {
  name: string;
  team: string;
  progress: number;
  status: string;
  tasks: string;
}

export function ProjectTable({
  projects,
  compact = false,
}: {
  projects: DashboardProject[];
  compact?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[520px] text-sm">
        <thead className="bg-zinc-50/60 text-left text-xs text-zinc-500 dark:bg-zinc-900/40 dark:text-zinc-400">
          <tr>
            <th className="px-4 py-3 font-medium">Project</th>
            <th className="px-4 py-3 font-medium">Progress</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Tasks</th>
            {!compact && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {projects.map((project) => (
            <tr
              key={project.name}
              className="text-zinc-900 hover:bg-zinc-50/60 dark:text-zinc-50 dark:hover:bg-zinc-900/40"
            >
              <td className="px-4 py-4">
                <p className="font-medium">{project.name}</p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {project.team} team
                </p>
              </td>
              <td className="px-4 py-4">
                <div className="flex min-w-28 items-center gap-3">
                  <Progress value={project.progress} className="h-1.5" />
                  <span className="text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                    {project.progress}%
                  </span>
                </div>
              </td>
              <td className="px-4 py-4">
                <Badge
                  variant={
                    project.status === "At risk" ? "outline" : "secondary"
                  }
                >
                  {project.status}
                </Badge>
              </td>
              <td className="px-4 py-4 text-xs text-zinc-500 dark:text-zinc-400">
                {project.tasks}
              </td>
              {!compact && (
                <td className="px-4 py-4 text-right">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`More actions for ${project.name}`}
                  >
                    <MoreHorizontal />
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
