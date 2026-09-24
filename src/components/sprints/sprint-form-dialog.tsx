"use client";

import { useEffect, useState } from "react";

import {
  createSprint,
  updateSprint,
  type Sprint,
  type SprintStatus,
} from "@/actions/sprint.action";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Loader2 } from "lucide-react";

import { toast } from "sonner";

type SprintFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  projectId: string;

  sprint?: Sprint | null;

  onSuccess?: (sprint: Sprint) => void;
};

export function SprintFormDialog({
  open,
  onOpenChange,
  projectId,
  sprint,
  onSuccess,
}: SprintFormDialogProps) {
  const editing = Boolean(sprint);

  const [name, setName] = useState("");

  const [goal, setGoal] = useState("");

  const [status, setStatus] = useState<SprintStatus>("PLANNING");

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (sprint) {
      setName(sprint.name);
      setGoal(sprint.goal ?? "");
      setStatus(sprint.status);
      setStartDate(toDateInputValue(sprint.startDate));
      setEndDate(toDateInputValue(sprint.endDate));
      return;
    }

    setName("");
    setGoal("");
    setStatus("PLANNING");
    setStartDate("");
    setEndDate("");
  }, [open, sprint]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Sprint name is required.");
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      toast.error("End date cannot be before start date.");
      return;
    }

    try {
      setLoading(true);

      if (sprint) {
        const result = await updateSprint({
          sprintId: sprint.id,
          name: name.trim(),
          goal: goal.trim(),
          status,
          startDate: startDate
            ? new Date(`${startDate}T00:00:00`).toISOString()
            : undefined,
          endDate: endDate
            ? new Date(`${endDate}T23:59:59`).toISOString()
            : undefined,
        });

        if (!result.ok) {
          toast.error(result.message ?? "Unable to update sprint.");
          return;
        }

        toast.success(result.message ?? "Sprint updated successfully.");

        if (result.data) {
          onSuccess?.(result.data);
        }

        onOpenChange(false);
        return;
      }

      const result = await createSprint({
        projectId,
        name: name.trim(),
        goal: goal.trim(),
        status,
        startDate: startDate
          ? new Date(`${startDate}T00:00:00`).toISOString()
          : undefined,
        endDate: endDate
          ? new Date(`${endDate}T23:59:59`).toISOString()
          : undefined,
      });

      if (!result.ok) {
        toast.error(result.message ?? "Unable to create sprint.");
        return;
      }

      toast.success(result.message ?? "Sprint created successfully.");

      if (result.data) {
        onSuccess?.(result.data);
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Sprint form error:", error);

      toast.error(
        editing ? "Unable to update sprint." : "Unable to create sprint.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!loading) {
          onOpenChange(value);
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit sprint" : "Create sprint"}</DialogTitle>

          <DialogDescription>
            {editing
              ? "Update the sprint details and timeline."
              : "Create a new sprint for this project."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="sprint-name">Name</Label>

            <Input
              id="sprint-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Sprint 1"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sprint-goal">Goal</Label>

            <Textarea
              id="sprint-goal"
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              placeholder="What should this sprint accomplish?"
              rows={4}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>

            <Select
              value={status}
              onValueChange={(value) => setStatus(value as SprintStatus)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="PLANNING">Planning</SelectItem>

                <SelectItem value="ACTIVE">Active</SelectItem>

                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sprint-start">Start date</Label>

              <Input
                id="sprint-start"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sprint-end">End date</Label>

              <Input
                id="sprint-end"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {editing ? "Updating..." : "Creating..."}
                </>
              ) : editing ? (
                "Update sprint"
              ) : (
                "Create sprint"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function toDateInputValue(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
