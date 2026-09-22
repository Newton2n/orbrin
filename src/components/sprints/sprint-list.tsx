"use client";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  deleteSprint,
  getSprintsByProject,
  type Sprint,
} from "@/actions/sprint.action";
import { StatusBadge } from "@/components/badge-status";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SprintDetailsDialog } from "./sprint-details-dialog";
import { SprintFormDialog } from "./sprint-form-dialog";
export function SprintList({
  projectId,
  canCreate = false,
  canEdit = false,
  canDelete = false,
  canViewDetails = false,
}: {
  projectId: string;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canViewDetails?: boolean;
}) {
  const [items, setItems] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<"create" | Sprint | null>(null);
  const [details, setDetails] = useState<Sprint | null>(null);
  const [target, setTarget] = useState<Sprint | null>(null);
  async function load() {
    setLoading(true);
    const result = await getSprintsByProject(projectId, {
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    if (result.success) setItems(result.data.items);
    else toast.error(result.message ?? "Unable to load sprints.");
    setLoading(false);
  }
  // biome-ignore lint/correctness/useExhaustiveDependencies: reload only when the project changes
  useEffect(() => {
    void load();
  }, [projectId]);
  async function remove() {
    if (!target) return;
    const result = await deleteSprint(target.id);
    if (!result.success)
      toast.error(result.message ?? "Unable to delete sprint.");
    else {
      toast.success(result.message ?? "Sprint deleted.");
      setTarget(null);
      void load();
    }
  }
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Sprints</CardTitle>
        {canCreate && (
          <Button onClick={() => setForm("create")}>
            <Plus />
            New sprint
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="py-6 text-center text-muted-foreground">
            Loading sprints...
          </p>
        ) : items.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No sprints planned for this project.
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((sprint) => (
              <div
                key={sprint.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{sprint.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {sprint.goal || "No goal defined"}
                  </p>
                </div>
                <StatusBadge value={sprint.status} />
                <span className="hidden text-xs text-muted-foreground sm:block">
                  {sprint.startDate
                    ? new Date(sprint.startDate).toLocaleDateString()
                    : "TBD"}
                </span>
                {canViewDetails && (
                  <Button
                    variant="ghost"
                    size="icon"
                    title="View sprint"
                    onClick={() => setDetails(sprint)}
                  >
                    <Eye />
                  </Button>
                )}
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Edit sprint"
                    onClick={() => setForm(sprint)}
                  >
                    <Pencil />
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Delete sprint"
                    onClick={() => setTarget(sprint)}
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
        {form && (
          <SprintFormDialog
            open
            onOpenChange={(open) => !open && setForm(null)}
            projectId={projectId}
            {...(form === "create"
              ? { mode: "create" }
              : { mode: "edit", sprint: form })}
          />
        )}
        <SprintDetailsDialog
          open={Boolean(details)}
          onOpenChange={(open) => !open && setDetails(null)}
          sprint={details}
          canEdit={canEdit}
          canDelete={canDelete}
          onEdit={() => details && setForm(details)}
          onDelete={() => details && setTarget(details)}
        />
        <DeleteConfirmDialog
          open={Boolean(target)}
          onOpenChange={(open) => !open && setTarget(null)}
          onCancel={() => setTarget(null)}
          onConfirm={() => void remove()}
          title="Delete sprint"
          description={`Delete ${target?.name ?? "this sprint"}? This cannot be undone.`}
        />
      </CardContent>
    </Card>
  );
}
