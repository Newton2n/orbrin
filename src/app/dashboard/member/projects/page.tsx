import { ArrowUpRight, CalendarDays, FolderKanban } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const projects = [
  {
    name: "Platform redesign",
    progress: 72,
    status: "In progress",
    due: "Sep 30",
  },
  { name: "Customer Portal", progress: 58, status: "Review", due: "Oct 08" },
  { name: "Billing workflow", progress: 34, status: "Planning", due: "Oct 20" },
];

export default function MemberProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Your work
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.04em]">
          Projects
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Stay close to the work you’re contributing to.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.name} className="border-border/70 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="grid size-10 place-items-center rounded-md bg-muted">
                  <FolderKanban className="size-4 text-muted-foreground" />
                </div>
                <Badge variant="secondary">{project.status}</Badge>
              </div>
              <CardTitle className="mt-4">{project.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-1.5" />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Due</span>
                <span>{project.due}</span>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-between px-0 text-primary"
                asChild
              >
                <Link href="#">
                  Open project <ArrowUpRight className="size-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarDays className="size-4" />
        <span>Next milestone: sprint review on Friday</span>
      </div>
    </div>
  );
}
