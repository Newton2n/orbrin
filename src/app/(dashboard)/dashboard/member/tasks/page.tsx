import { Search } from "lucide-react";
import { Badge } from "../../../../../components/ui/badge";
import { Button } from "../../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import { Input } from "../../../../../components/ui/input";

const tasks = [
  {
    title: "Review authentication flow",
    status: "IN_PROGRESS",
    priority: "HIGH",
    project: "Platform redesign",
    due: "Today",
  },
  {
    title: "Write release notes",
    status: "TODO",
    priority: "MEDIUM",
    project: "Customer Portal",
    due: "Tomorrow",
  },
  {
    title: "Validate onboarding copy",
    status: "REVIEW",
    priority: "LOW",
    project: "Marketing ops",
    due: "Fri",
  },
];

export default function MemberTasksPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Your work
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.04em]">
          My tasks
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Keep your priorities visible and your sprint on track.
        </p>
      </div>

      <Card className="border-border/70 shadow-none">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search my tasks" />
            </div>
            <Button variant="outline">Status</Button>
            <Button variant="outline">Priority</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-none">
        <CardHeader>
          <CardTitle>Open tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.title}
              className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {task.project}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {task.status.replace("_", " ")}
                </Badge>
                <Badge
                  variant={
                    task.priority === "HIGH"
                      ? "outline"
                      : task.priority === "MEDIUM"
                        ? "secondary"
                        : "default"
                  }
                >
                  {task.priority}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Due {task.due}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
