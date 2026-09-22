import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  FolderKanban,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "../../../../../components/ui/badge";
import { Button } from "../../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import { Input } from "../../../../../components/ui/input";
import { Progress } from "../../../../../components/ui/progress";

const projects = [
  {
    name: "Platform redesign",
    status: "IN_PROGRESS",
    team: "Product",
    progress: 72,
    tasks: 18,
    deadline: "Sep 30",
  },
  {
    name: "Mobile experience",
    status: "REVIEW",
    team: "Growth",
    progress: 61,
    tasks: 13,
    deadline: "Oct 08",
  },
  {
    name: "API modernization",
    status: "TODO",
    team: "Engineering",
    progress: 32,
    tasks: 9,
    deadline: "Oct 12",
  },
];

export default function ManagerProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Execution
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.04em]">
            Projects
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Drive delivery across the portfolio with clear focus and momentum.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/manager/projects/new">Create project</Link>
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
                <p className="text-xs text-muted-foreground">Open</p>
                <p className="mt-2 font-heading text-3xl font-semibold">8</p>
              </div>
              <FolderKanban className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Tasks</p>
                <p className="mt-2 font-heading text-3xl font-semibold">47</p>
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
                <p className="mt-2 font-heading text-3xl font-semibold">4</p>
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
          <CardTitle>Portfolio</CardTitle>
          <Link
            href="#"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Review all <ArrowUpRight className="size-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.name}
              className="rounded-lg border border-border p-4"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="font-medium">{project.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {project.team} team
                  </p>
                </div>
                <Badge>{project.status.replace("_", " ")}</Badge>
              </div>
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-1.5" />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span>{project.tasks} tasks</span>
                <span>Due {project.deadline}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
