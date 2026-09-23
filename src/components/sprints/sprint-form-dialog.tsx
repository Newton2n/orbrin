"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createSprint,
  type Sprint,
  type SprintStatus,
  updateSprint,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSuccess?: () => void;
} & ({ mode: "create" } | { mode: "edit"; sprint: Sprint });
const statuses: SprintStatus[] = ["PLANNING", "ACTIVE", "COMPLETED"];
export function SprintFormDialog(props: Props) {
  const { open, onOpenChange, projectId, mode, onSuccess } = props;
  const sprint = mode === "edit" ? props.sprint : null;
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [status, setStatus] = useState<SprintStatus>("PLANNING");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!open) return;
    setName(sprint?.name ?? "");
    setGoal(sprint?.goal ?? "");
    setStatus(sprint?.status ?? "PLANNING");
    setStartDate(sprint?.startDate?.slice(0, 10) ?? "");
    setEndDate(sprint?.endDate?.slice(0, 10) ?? "");
  }, [open, sprint]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return toast.error("Sprint name is required.");
    if (startDate && endDate && endDate < startDate) {
      return toast.error("End date cannot be earlier than start date.");
    }
    setSaving(true);
    const input = {
      name: name.trim(),
      goal,
      status,
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    };
    const result =
      mode === "create"
        ? await createSprint(projectId, input)
        : sprint
          ? await updateSprint(sprint.id, input)
          : null;
    setSaving(false);
    if (!result) return;
    if (!result.success)
      return toast.error(result.message ?? "Unable to save sprint.");
    toast.success(result.message ?? "Sprint saved.");
    onOpenChange(false);
    onSuccess?.();
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create sprint" : "Edit sprint"}
          </DialogTitle>
          <DialogDescription>
            Set the sprint goal, schedule, and delivery status.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sprint-name">Name</Label>
            <Input
              id="sprint-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sprint-goal">Goal</Label>
            <Textarea
              id="sprint-goal"
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(value) =>
                value && setStatus(value as SprintStatus)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sprint-end">End date</Label>
              <Input
                id="sprint-end"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save sprint"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
