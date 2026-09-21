"use client";

import { MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  addComment,
  getTaskComments,
  type Task,
  type TaskInput,
  type TaskPriority,
  type TaskStatus,
  updateTask,
} from "../../actions/task.action";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { Textarea } from "../ui/textarea";

const priorities: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const statuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];
const priorityClass: Record<TaskPriority, string> = {
  LOW: "bg-slate-100 text-slate-700",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-amber-100 text-amber-700",
  URGENT: "bg-red-100 text-red-700",
};

export function TaskDetailSheet({
  task,
  open,
  onOpenChange,
}: {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<
    Awaited<ReturnType<typeof getTaskComments>>["data"]
  >([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  useEffect(() => {
    if (!task) return;
    setCommentsLoading(true);
    getTaskComments(task.id).then((result) => {
      if (result.success) setComments(result.data);
      setCommentsLoading(false);
    });
  }, [task]);
  if (!task) return null;
  const currentTask = task;
  async function update(values: Partial<TaskInput>) {
    try {
      const result = await updateTask(currentTask.id, values);
      if (!result.success) throw new Error(result.message);
      toast.success("Task updated");
      window.location.reload();
    } catch (error) {
      toast.error("Could not update task", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  }
  async function submitComment() {
    if (!comment.trim()) return;
    try {
      const result = await addComment(currentTask.id, comment.trim());
      if (!result.success) throw new Error(result.message);
      setComment("");
      const refreshed = await getTaskComments(currentTask.id);
      if (refreshed.success) setComments(refreshed.data);
    } catch (error) {
      toast.error("Could not add comment", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <Badge className={priorityClass[task.priority]}>
              {task.priority}
            </Badge>
            <span className="text-xs text-muted-foreground">Task detail</span>
          </div>
          <SheetTitle className="text-xl">{task.title}</SheetTitle>
          <SheetDescription>
            {task.description || "No description added yet."}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 px-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 text-xs font-medium">
              Status
              <Select
                value={task.status}
                onValueChange={(value) =>
                  update({ status: value as TaskStatus })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 text-xs font-medium">
              Priority
              <Select
                value={task.priority}
                onValueChange={(value) =>
                  update({ priority: value as TaskPriority })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <section aria-labelledby="comments-heading">
            <div className="mb-3 flex items-center gap-2">
              <MessageSquare className="size-4" />
              <h3
                id="comments-heading"
                className="font-heading text-sm font-semibold"
              >
                Comments
              </h3>
            </div>
            <div className="space-y-3">
              {commentsLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading comments...
                </p>
              ) : comments?.length ? (
                comments.map((item) => (
                  <div key={item.id} className="rounded-md bg-muted/60 p-3">
                    <p className="text-sm">{item.content}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.user?.fullName ?? "Team member"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No comments yet. Start the conversation.
                </p>
              )}
            </div>
            <div className="mt-4 space-y-2">
              <Textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Add context for the team..."
                aria-label="New comment"
              />
              <Button
                size="sm"
                onClick={submitComment}
                disabled={!comment.trim()}
              >
                Add comment
              </Button>
            </div>
          </section>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
