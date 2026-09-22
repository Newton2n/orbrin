"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getOrganizationMembers } from "@/actions/organization.action";
import {
  createTask,
  type Task,
  type TaskPriority,
  type TaskStatus,
  updateTask,
} from "@/actions/task.action";
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

type TaskFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
} & ({ mode: "create"; task?: never } | { mode: "edit"; task: Task });

type MemberOption = { id: string; name?: string; email?: string };

function membersFrom(value: unknown): MemberOption[] {
  if (Array.isArray(value)) return value as MemberOption[];
  if (value && typeof value === "object") {
    const source = value as Record<string, unknown>;
    return membersFrom(source.members ?? source.items ?? source.data);
  }
  return [];
}

const statuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];
const priorities: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export function TaskFormDialog(props: TaskFormDialogProps) {
  const { open, onOpenChange, projectId, mode } = props;
  const task = mode === "edit" ? props.task : null;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
    setStatus(task?.status ?? "TODO");
    setPriority(task?.priority ?? "MEDIUM");
    setDueDate(task?.dueDate ? task.dueDate.slice(0, 10) : "");
    setAssigneeId(task?.assigneeId ?? "");
    getOrganizationMembers().then((result) => {
      if (result.success) setMembers(membersFrom(result.data));
    });
  }, [open, task]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      toast.error("Task title is required.");
      return;
    }
    setSaving(true);
    const input = {
      title: title.trim(),
      description,
      status,
      priority,
      ...(dueDate ? { dueDate } : {}),
      ...(assigneeId && assigneeId !== "UNASSIGNED" ? { assigneeId } : {}),
    };
    const result =
      mode === "create"
        ? await createTask(projectId, input)
        : task
          ? await updateTask(task.id, input)
          : null;
    setSaving(false);
    if (!result) return;
    if (!result.ok) {
      toast.error(result.message ?? "Unable to save task.");
      return;
    }
    toast.success(result.message ?? "Task saved.");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create task" : "Edit task"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add an accountable piece of work to this project."
              : "Update task details and ownership."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(value) =>
                  value && setStatus(value as TaskStatus)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) =>
                  value && setPriority(value as TaskPriority)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-due-date">Due date</Label>
              <Input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select
                value={assigneeId || "UNASSIGNED"}
                onValueChange={(value) =>
                  setAssigneeId(value === "UNASSIGNED" ? "" : (value ?? ""))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name ?? member.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              {saving
                ? "Saving..."
                : mode === "create"
                  ? "Create task"
                  : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
