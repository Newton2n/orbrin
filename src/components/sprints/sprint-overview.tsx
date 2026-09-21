"use client";

import { CalendarDays, Flag } from "lucide-react";
import { useEffect, useState } from "react";
import { getSprints, type Sprint } from "../../actions/sprint.action";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

function formatDate(value?: string) {
  return value
    ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
        new Date(value),
      )
    : "TBD";
}

export function SprintOverview({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    getSprints(projectId).then((result) => {
      if (result.success) setItems(result.data.items);
      setLoading(false);
    });
  }, [projectId]);
  return (
    <section aria-labelledby="sprints-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
            Planning
          </p>
          <h2
            id="sprints-heading"
            className="font-heading text-lg font-semibold"
          >
            Sprint outlook
          </h2>
        </div>
        <span className="text-xs text-muted-foreground">
          {items.length} planned
        </span>
      </div>
      {!projectId ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Select a project to view its sprint plan.
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-28 animate-pulse rounded-lg bg-muted" />
          <div className="h-28 animate-pulse rounded-lg bg-muted" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No sprints have been planned for this project.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((sprint) => (
            <Card key={sprint.id}>
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle>{sprint.name}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {sprint.goal || "No goal defined"}
                  </p>
                </div>
                <Badge
                  variant={sprint.status === "ACTIVE" ? "default" : "secondary"}
                >
                  {sprint.status}
                </Badge>
              </CardHeader>
              <CardContent className="flex gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="size-3.5" />
                  {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Flag className="size-3.5" />
                  {sprint.status === "ACTIVE" ? "In progress" : "Upcoming"}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
