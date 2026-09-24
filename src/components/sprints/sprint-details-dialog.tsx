"use client";

import { CalendarDays, CheckCircle2, Clock3, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Separator } from "@/components/ui/separator";

import type { Sprint, SprintStatus } from "@/actions/sprint.action";

type SprintDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sprint: Sprint | null;
};

export function SprintDetailsDialog({
  open,
  onOpenChange,
  sprint,
}: SprintDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {!sprint ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Loading sprint...
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-start gap-3 pr-6">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                  <Target className="size-5 text-primary" />
                </div>

                <div className="min-w-0">
                  <DialogTitle className="truncate">{sprint.name}</DialogTitle>

                  <DialogDescription className="mt-1">
                    Sprint details and delivery timeline.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              {/* Status */}
              <div className="flex flex-wrap items-center gap-3">
                <SprintStatusBadge status={sprint.status} />

                <span className="text-sm text-muted-foreground">
                  {sprint.tasks?.length ?? 0} tasks
                </span>
              </div>

              <Separator />

              {/* Goal */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Target className="size-4 text-muted-foreground" />
                  Sprint goal
                </div>

                <p className="text-sm leading-6 text-muted-foreground">
                  {sprint.goal || "No goal has been specified for this sprint."}
                </p>
              </div>

              {/* Timeline */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <CalendarDays className="size-4 text-muted-foreground" />
                    Start date
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {formatDate(sprint.startDate)}
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Clock3 className="size-4 text-muted-foreground" />
                    End date
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {formatDate(sprint.endDate)}
                  </p>
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-muted-foreground" />

                  <h3 className="text-sm font-medium">Tasks</h3>

                  <Badge variant="secondary">{sprint.tasks?.length ?? 0}</Badge>
                </div>

                {sprint.tasks && sprint.tasks.length > 0 ? (
                  <div className="space-y-2">
                    {sprint.tasks.map((task) => (
                      <div key={task.id} className="rounded-lg border p-3">
                        <p className="text-sm font-medium">{task.title}</p>

                        {task.description ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {task.description}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-5 text-center">
                    <p className="text-sm text-muted-foreground">
                      No tasks are assigned to this sprint yet.
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Metadata */}
              <div className="grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>

                  <p className="mt-1">{formatDateTime(sprint.createdAt)}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Last updated</p>

                  <p className="mt-1">{formatDateTime(sprint.updatedAt)}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SprintStatusBadge({ status }: { status: SprintStatus }) {
  if (status === "ACTIVE") {
    return <Badge>Active</Badge>;
  }

  if (status === "COMPLETED") {
    return <Badge variant="secondary">Completed</Badge>;
  }

  return <Badge variant="outline">Planning</Badge>;
}

function formatDate(value: string | null) {
  if (!value) {
    return "No date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
