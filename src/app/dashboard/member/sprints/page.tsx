import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sprints = [
  {
    name: "Sprint 14 · Platform",
    status: "ACTIVE",
    progress: 68,
    start: "Sep 12",
    end: "Sep 25",
  },
  {
    name: "Sprint 13 · Customer",
    status: "COMPLETED",
    progress: 100,
    start: "Aug 29",
    end: "Sep 11",
  },
];

export default function MemberSprintsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Delivery
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.04em]">
          Sprints
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track your active sprint and the work coming up next.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sprints.map((sprint) => (
          <Card key={sprint.name} className="border-border/70 shadow-none">
            <CardHeader className="flex-row items-center justify-between gap-4">
              <CardTitle>{sprint.name}</CardTitle>
              <Badge
                variant={sprint.status === "ACTIVE" ? "default" : "secondary"}
              >
                {sprint.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{sprint.start}</span>
                <span>{sprint.end}</span>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Completion</span>
                  <span>{sprint.progress}%</span>
                </div>
                <Progress value={sprint.progress} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
