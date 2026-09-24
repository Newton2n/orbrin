"use client";

import { CalendarDays, Flag } from "lucide-react";
import { useEffect, useState } from "react";

import { getSprints, type Sprint } from "@/actions/sprint.action";

import { StatusBadge } from "@/components/badge-status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatDate(value?: string | null) {
  if (!value) return "TBD";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function SprintOverview({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    let cancelled = false;

    async function load() {
      setLoading(true);

      const result = await getSprints(projectId, {
        page: 1,
        limit: 5,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (!cancelled) {
        if (result.success) {
          // SprintListResponse contains `sprints`, not `items`
          setItems(result.data.sprints);
        } else {
          setItems([]);
        }

        setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return (
    <section aria-labelledby="sprints-heading" className="space-y-3">
      <div className="flex items-end justify-between gap-3">
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
          {items.length} {items.length === 1 ? "sprint" : "sprints"}
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
          <div className="h-32 animate-pulse rounded-lg bg-muted" />
          <div className="h-32 animate-pulse rounded-lg bg-muted" />
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
              <CardHeader className="gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="truncate">{sprint.name}</CardTitle>

                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {sprint.goal || "No goal defined"}
                    </p>
                  </div>

                  <StatusBadge value={sprint.status} />
                </div>
              </CardHeader>

              <CardContent className="grid gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5 shrink-0" />

                  <span>
                    {formatDate(sprint.startDate)} -{" "}
                    {formatDate(sprint.endDate)}
                  </span>
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <Flag className="size-3.5 shrink-0" />

                  <span>
                    {sprint.status === "ACTIVE"
                      ? "In progress"
                      : sprint.status === "COMPLETED"
                        ? "Completed"
                        : "Planning"}
                  </span>
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
