import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  FolderKanban,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const projects = [
  {
    name: "Orbrin Platform",
    status: "IN_PROGRESS",
    team: "Engineering",
    progress: 72,
    tasks: 28,
    deadline: "Sep 30",
  },
  {
    name: "Customer Portal",
    status: "REVIEW",
    team: "Product",
    progress: 61,
    tasks: 21,
    deadline: "Oct 08",
  },
  {
    name: "Billing Refresh",
    status: "TODO",
    team: "Finance",
    progress: 22,
    tasks: 14,
    deadline: "Oct 15",
  },
  {
    name: "Mobile Workflows",
    status: "DONE",
    team: "Growth",
    progress: 100,
    tasks: 18,
    deadline: "Sep 19",
  },
];

const statusStyles: Record<string, string> = {
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  REVIEW: "bg-amber-100 text-amber-700",
  TODO: "bg-slate-100 text-slate-700",
  DONE: "bg-emerald-100 text-emerald-700",
};

export default function AdminProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Workspace
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.04em]">
            Projects
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage and track your organization’s project portfolio.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/admin/projects/new">Create project</Link>
        </Button>
      </div>

      <Card className="border-border/70 shadow-none">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search projects" />
            </div>
            <Button variant="outline">All statuses</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Projects</p>
                <p className="mt-2 font-heading text-3xl font-semibold">18</p>
              </div>
              <FolderKanban className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active</p>
                <p className="mt-2 font-heading text-3xl font-semibold">6</p>
              </div>
              <CheckCircle2 className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Teams</p>
                <p className="mt-2 font-heading text-3xl font-semibold">7</p>
              </div>
              <Users className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Deadlines</p>
                <p className="mt-2 font-heading text-3xl font-semibold">12</p>
              </div>
              <CalendarDays className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 shadow-none">
        <CardHeader className="flex-row items-center justify-between gap-4">
          <CardTitle>All projects</CardTitle>
          <Link
            href="#"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View portfolio <ArrowUpRight className="size-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b text-left text-xs text-muted-foreground">
              <tr>
                <th className="pb-3 font-medium">Project</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Team</th>
                <th className="pb-3 font-medium">Tasks</th>
                <th className="pb-3 font-medium">Progress</th>
                <th className="pb-3 font-medium">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {projects.map((project) => (
                <tr key={project.name} className="align-middle">
                  <td className="py-4">
                    <p className="font-medium">{project.name}</p>
                  </td>
                  <td className="py-4">
                    <Badge className={statusStyles[project.status]}>
                      {project.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="py-4 text-muted-foreground">{project.team}</td>
                  <td className="py-4 text-muted-foreground">
                    {project.tasks}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <Progress
                        value={project.progress}
                        className="h-1.5 w-28"
                      />
                      <span className="text-xs text-muted-foreground">
                        {project.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-muted-foreground">
                    {project.deadline}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
