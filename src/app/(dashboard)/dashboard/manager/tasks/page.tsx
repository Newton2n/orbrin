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
    title: "Review onboarding flow",
    status: "IN_PROGRESS",
    priority: "HIGH",
    assignee: "Sarah",
    project: "Platform redesign",
    due: "Today",
  },
  {
    title: "Finalize sprint metrics",
    status: "REVIEW",
    priority: "MEDIUM",
    assignee: "Alex",
    project: "API modernization",
    due: "Tomorrow",
  },
  {
    title: "Resolve mobile QA cases",
    status: "TODO",
    priority: "URGENT",
    assignee: "Nina",
    project: "Mobile experience",
    due: "Sep 25",
  },
];

export default function ManagerTasksPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Execution
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.04em]">
          Tasks
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Prioritize what matters most across active delivery work.
        </p>
      </div>

      <Card className="border-border/70 shadow-none">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search tasks" />
            </div>
            <Button variant="outline">Status</Button>
            <Button variant="outline">Priority</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-none">
        <CardHeader>
          <CardTitle>Active task queue</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b text-left text-xs text-muted-foreground">
              <tr>
                <th className="pb-3 font-medium">Task</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Priority</th>
                <th className="pb-3 font-medium">Assignee</th>
                <th className="pb-3 font-medium">Project</th>
                <th className="pb-3 font-medium">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tasks.map((task) => (
                <tr key={task.title}>
                  <td className="py-4 font-medium">{task.title}</td>
                  <td className="py-4">
                    <Badge variant="secondary">
                      {task.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="py-4">
                    <Badge
                      variant={
                        task.priority === "URGENT"
                          ? "destructive"
                          : task.priority === "HIGH"
                            ? "outline"
                            : "secondary"
                      }
                    >
                      {task.priority}
                    </Badge>
                  </td>
                  <td className="py-4 text-muted-foreground">
                    {task.assignee}
                  </td>
                  <td className="py-4 text-muted-foreground">{task.project}</td>
                  <td className="py-4 text-muted-foreground">{task.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
