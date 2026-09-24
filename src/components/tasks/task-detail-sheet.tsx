"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  CircleDot,
  Flag,
  FolderKanban,
  Loader2,
  Pencil,
  Target,
  Trash2,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  deleteTask,
  updateTask,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/actions/task.action";

import {
  getOrganizationMembers,
  type OrganizationMember,
} from "@/actions/organization.action";

import {
  getSprintsByProject,
  type Sprint,
} from "@/actions/sprint.action";

import { CommentList } from "@/components/comments/comment-list";

import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

import { Badge } from "@/components/ui/badge";

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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { Separator } from "@/components/ui/separator";

import { Textarea } from "@/components/ui/textarea";

type TaskRole = "ADMIN" | "MANAGER" | "MEMBER";

type TaskDetailSheetProps = {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: TaskRole;
  currentUserId?: string;
  canUpdate?: boolean;
  canDelete?: boolean;
  onUpdated?: (task: Task) => void;
  onDeleted?: (taskId: string) => void;
};

type AssigneeOption = {
  id: string;
  fullName: string;
  email: string;
};

const taskStatusSchema = z.enum([
  "TODO",
  "IN_PROGRESS",
  "DONE",
]);

const taskPrioritySchema = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
]);

const taskEditSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Task title is required.")
    .max(
      200,
      "Task title must be less than 200 characters.",
    ),

  description: z
    .string()
    .trim()
    .max(
      5000,
      "Description must be less than 5000 characters.",
    ),

  status: taskStatusSchema,

  priority: taskPrioritySchema,

  dueDate: z.string(),

  assigneeId: z.string(),

  sprintId: z.string(),
});

type TaskEditFormValues = z.infer<
  typeof taskEditSchema
>;

function statusLabel(status: Task["status"]) {
  switch (status) {
    case "IN_PROGRESS":
      return "In progress";

    case "DONE":
      return "Done";

    case "REVIEW":
      return "Review";

    default:
      return "To do";
  }
}

function formatDate(value?: string | null) {
  if (!value) {
    return "No due date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(date);
}

function getPriorityVariant(
  priority: Task["priority"],
): "default" | "secondary" | "outline" | "destructive" {
  if (priority === "URGENT") {
    return "destructive";
  }

  if (priority === "HIGH") {
    return "outline";
  }

  if (priority === "MEDIUM") {
    return "secondary";
  }

  return "default";
}

function getDateInputValue(
  value?: string | null,
) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().split("T")[0];
}

export function TaskDetailSheet({
  task,
  open,
  onOpenChange,
  role = "MEMBER",
  currentUserId,
  canUpdate = true,
  canDelete = false,
  onUpdated,
  onDeleted,
}: TaskDetailSheetProps) {
  const [editMode, setEditMode] = useState(false);

  const [assignees, setAssignees] = useState<
    AssigneeOption[]
  >([]);

  const [sprints, setSprints] = useState<Sprint[]>(
    [],
  );

  const [loadingAssignees, setLoadingAssignees] =
    useState(false);

  const [loadingSprints, setLoadingSprints] =
    useState(false);

  const [deleting, setDeleting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);

  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<TaskEditFormValues>({
    resolver: zodResolver(taskEditSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: "",
      assigneeId: "",
      sprintId: "",
    },
  });

  useEffect(() => {
    if (!task) {
      return;
    }

    reset({
      title: task.title,
      description: task.description ?? "",
      status:
        task.status === "REVIEW"
          ? "IN_PROGRESS"
          : task.status,
      priority: task.priority,
      dueDate: getDateInputValue(task.dueDate),
      assigneeId: task.assigneeId ?? "",
      sprintId: task.sprintId ?? "",
    });

    setEditMode(false);
    setError("");
  }, [task, reset]);

  useEffect(() => {
    if (!open || !editMode || !task) {
      return;
    }

    const loadEditData = async () => {
      setLoadingAssignees(true);
      setLoadingSprints(true);

      try {
        const [
          memberResult,
          sprintResult,
        ] = await Promise.all([
          getOrganizationMembers({
            page: 1,
            limit: 100,
            status: "ACTIVE",
          }),

          getSprintsByProject(task.projectId, {
            page: 1,
            limit: 100,
            sortBy: "createdAt",
            sortOrder: "desc",
          }),
        ]);

        if (memberResult.success) {
          const options =
            memberResult.data.items
              .filter(
                (member: OrganizationMember) =>
                  member.status === "ACTIVE" &&
                  member.user?.status === "ACTIVE",
              )
              .map(
                (
                  member: OrganizationMember,
                ) => ({
                  id: member.user!.id,
                  fullName:
                    member.user!.fullName,
                  email:
                    member.user!.email,
                }),
              );

          setAssignees(options);
        } else {
          setAssignees([]);
        }

        if (sprintResult.ok) {
          setSprints(
            sprintResult.data.sprints ?? [],
          );
        } else {
          setSprints([]);
        }
      } catch (error) {
        console.error(
          "Failed to load task edit data:",
          error,
        );

        setAssignees([]);
        setSprints([]);
      } finally {
        setLoadingAssignees(false);
        setLoadingSprints(false);
      }
    };

    void loadEditData();
  }, [open, editMode, task]);

  if (!task) {
    return null;
  }

  const canComment =
    role === "ADMIN" ||
    role === "MANAGER" ||
    role === "MEMBER";

  const canEditAnyComment =
    role === "ADMIN" ||
    role === "MANAGER";

  const canDeleteAnyComment =
    role === "ADMIN" ||
    role === "MANAGER";

  const selectedAssignee =
    assignees.find(
      (assignee) =>
        assignee.id ===
        task.assigneeId,
    );

  const selectedSprint =
    sprints.find(
      (sprint) =>
        sprint.id === task.sprintId,
    );

  const handleEditStart = () => {
    reset({
      title: task.title,
      description:
        task.description ?? "",
      status:
        task.status === "REVIEW"
          ? "IN_PROGRESS"
          : task.status,
      priority: task.priority,
      dueDate: getDateInputValue(
        task.dueDate,
      ),
      assigneeId:
        task.assigneeId ?? "",
      sprintId:
        task.sprintId ?? "",
    });

    setError("");
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    reset({
      title: task.title,
      description:
        task.description ?? "",
      status:
        task.status === "REVIEW"
          ? "IN_PROGRESS"
          : task.status,
      priority: task.priority,
      dueDate: getDateInputValue(
        task.dueDate,
      ),
      assigneeId:
        task.assigneeId ?? "",
      sprintId:
        task.sprintId ?? "",
    });

    setError("");
    setEditMode(false);
  };

  async function onSubmit(
    values: TaskEditFormValues,
  ) {
    setError("");

    try {
      const result = await updateTask({
        taskId: task?.id as string,
        title: values.title.trim(),
        description:
          values.description.trim(),
        status: values.status as Extract<
          TaskStatus,
          "TODO" | "IN_PROGRESS" | "DONE"
        >,
        priority:
          values.priority as TaskPriority,
        dueDate:
          values.dueDate || undefined,
        assigneeId:
          values.assigneeId || undefined,
        sprintId:
          values.sprintId || undefined,
      });

      if (!result.ok) {
        setError(
          result.message ??
            "Unable to update task.",
        );
        return;
      }

      const updatedTask: Task = {
        ...task,
        ...result.data,
      };

      onUpdated?.(updatedTask);

      setEditMode(false);
    } catch (error) {
      console.error(
        "Failed to update task:",
        error,
      );

      setError(
        "Something went wrong while updating the task.",
      );
    }
  }

  const handleDelete = async () => {
    setDeleting(true);
    setError("");

    try {
      const result =
        await deleteTask(task.id);

      if (!result.ok) {
        setError(
          result.message ??
            "Unable to delete task.",
        );
        return;
      }

      setDeleteDialogOpen(false);

      onDeleted?.(task.id);

      onOpenChange(false);
    } catch (error) {
      console.error(
        "Failed to delete task:",
        error,
      );

      setError(
        "Something went wrong while deleting the task.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(value) => {
          if (
            !value &&
            editMode &&
            !isSubmitting
          ) {
            setEditMode(false);
          }

          onOpenChange(value);
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader className="pr-8">
            {editMode ? (
              <>
                <SheetTitle>
                  Edit task
                </SheetTitle>

                <SheetDescription>
                  Update the task details and
                  save your changes.
                </SheetDescription>
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    {statusLabel(
                      task.status,
                    )}
                  </Badge>

                  <Badge
                    variant={getPriorityVariant(
                      task.priority,
                    )}
                  >
                    {task.priority}
                  </Badge>
                </div>

                <SheetTitle className="text-xl leading-7">
                  {task.title}
                </SheetTitle>

                <SheetDescription>
                  Task details and team
                  discussion.
                </SheetDescription>
              </>
            )}
          </SheetHeader>

          <div className="space-y-6 px-4 pb-8">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {editMode ? (
              <form
                onSubmit={handleSubmit(
                  onSubmit,
                )}
                className="space-y-5"
              >
                {/* Title */}
                <div className="space-y-2">
                  <label
                    htmlFor="task-title"
                    className="text-sm font-medium"
                  >
                    Title
                  </label>

                  <Input
                    id="task-title"
                    {...register("title")}
                    placeholder="Enter task title"
                    disabled={isSubmitting}
                    aria-invalid={Boolean(
                      errors.title,
                    )}
                  />

                  {errors.title && (
                    <p className="text-sm text-destructive">
                      {
                        errors.title
                          .message
                      }
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label
                    htmlFor="task-description"
                    className="text-sm font-medium"
                  >
                    Description
                  </label>

                  <Textarea
                    id="task-description"
                    {...register(
                      "description",
                    )}
                    placeholder="Describe the task..."
                    rows={6}
                    disabled={isSubmitting}
                    aria-invalid={Boolean(
                      errors.description,
                    )}
                  />

                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {
                        errors
                          .description
                          .message
                      }
                    </p>
                  )}
                </div>

                {/* Sprint */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Sprint
                  </label>

                  <Controller
                    name="sprintId"
                    control={control}
                    render={({
                      field,
                    }) => (
                      <Select
                        value={
                          field.value ||
                          "NO_SPRINT"
                        }
                        onValueChange={(
                          value,
                        ) => {
                          field.onChange(
                            value ===
                              "NO_SPRINT"
                              ? ""
                              : value,
                          );
                        }}
                        disabled={
                          isSubmitting ||
                          loadingSprints
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              loadingSprints
                                ? "Loading sprints..."
                                : "Select sprint"
                            }
                          />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="NO_SPRINT">
                            No sprint
                          </SelectItem>

                          {sprints.map(
                            (sprint) => (
                              <SelectItem
                                key={
                                  sprint.id
                                }
                                value={
                                  sprint.id
                                }
                              >
                                {
                                  sprint.name
                                }
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />

                  {errors.sprintId && (
                    <p className="text-sm text-destructive">
                      {
                        errors
                          .sprintId
                          .message
                      }
                    </p>
                  )}
                </div>

                {/* Assignee */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Assignee
                  </label>

                  <Controller
                    name="assigneeId"
                    control={control}
                    render={({
                      field,
                    }) => {
                      const selected =
                        assignees.find(
                          (
                            assignee,
                          ) =>
                            assignee.id ===
                            field.value,
                        );

                      return (
                        <>
                          <Select
                            value={
                              field.value ||
                              "UNASSIGNED"
                            }
                            onValueChange={(
                              value,
                            ) => {
                              field.onChange(
                                value ===
                                  "UNASSIGNED"
                                  ? ""
                                  : value,
                              );
                            }}
                            disabled={
                              isSubmitting ||
                              loadingAssignees
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={
                                  loadingAssignees
                                    ? "Loading members..."
                                    : "Select assignee"
                                }
                              />
                            </SelectTrigger>

                            <SelectContent>
                              <SelectItem value="UNASSIGNED">
                                Unassigned
                              </SelectItem>

                              {assignees.map(
                                (
                                  assignee,
                                ) => (
                                  <SelectItem
                                    key={
                                      assignee.id
                                    }
                                    value={
                                      assignee.id
                                    }
                                  >
                                    {
                                      assignee.fullName
                                    }
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>

                          {selected && (
                            <p className="text-xs text-muted-foreground">
                              {
                                selected.email
                              }
                            </p>
                          )}
                        </>
                      );
                    }}
                  />

                  {errors.assigneeId && (
                    <p className="text-sm text-destructive">
                      {
                        errors
                          .assigneeId
                          .message
                      }
                    </p>
                  )}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Status
                  </label>

                  <Controller
                    name="status"
                    control={control}
                    render={({
                      field,
                    }) => (
                      <Select
                        value={
                          field.value
                        }
                        onValueChange={(
                          value,
                        ) => {
                          if (
                            value !==
                            null
                          ) {
                            field.onChange(
                              value,
                            );
                          }
                        }}
                        disabled={
                          isSubmitting
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="TODO">
                            To do
                          </SelectItem>

                          <SelectItem value="IN_PROGRESS">
                            In progress
                          </SelectItem>

                          <SelectItem value="DONE">
                            Done
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />

                  {errors.status && (
                    <p className="text-sm text-destructive">
                      {
                        errors
                          .status
                          .message
                      }
                    </p>
                  )}
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Priority
                  </label>

                  <Controller
                    name="priority"
                    control={control}
                    render={({
                      field,
                    }) => (
                      <Select
                        value={
                          field.value
                        }
                        onValueChange={(
                          value,
                        ) => {
                          if (
                            value !==
                            null
                          ) {
                            field.onChange(
                              value,
                            );
                          }
                        }}
                        disabled={
                          isSubmitting
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="LOW">
                            Low
                          </SelectItem>

                          <SelectItem value="MEDIUM">
                            Medium
                          </SelectItem>

                          <SelectItem value="HIGH">
                            High
                          </SelectItem>

                          <SelectItem value="URGENT">
                            Urgent
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />

                  {errors.priority && (
                    <p className="text-sm text-destructive">
                      {
                        errors
                          .priority
                          .message
                      }
                    </p>
                  )}
                </div>

                {/* Due date */}
                <div className="space-y-2">
                  <label
                    htmlFor="task-due-date"
                    className="text-sm font-medium"
                  >
                    Due date
                  </label>

                  <Input
                    id="task-due-date"
                    type="date"
                    {...register(
                      "dueDate",
                    )}
                    disabled={isSubmitting}
                    aria-invalid={Boolean(
                      errors.dueDate,
                    )}
                  />

                  {errors.dueDate && (
                    <p className="text-sm text-destructive">
                      {
                        errors
                          .dueDate
                          .message
                      }
                    </p>
                  )}
                </div>

                {/* Edit actions */}
                <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={
                      handleCancelEdit
                    }
                    disabled={
                      isSubmitting
                    }
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={
                      isSubmitting
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 size-4" />
                        Save changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <>
                {/* Description */}
                <div className="rounded-xl border bg-muted/20 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-6">
                    {task.description ||
                      "No description provided."}
                  </p>
                </div>

                {/* Information */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Flag className="size-3.5" />
                      Priority
                    </div>

                    <p className="mt-1 text-sm font-medium">
                      {task.priority}
                    </p>
                  </div>

                  <div className="rounded-xl border p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CircleDot className="size-3.5" />
                      Status
                    </div>

                    <p className="mt-1 text-sm font-medium">
                      {statusLabel(
                        task.status,
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl border p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarDays className="size-3.5" />
                      Due date
                    </div>

                    <p className="mt-1 text-sm font-medium">
                      {formatDate(
                        task.dueDate,
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl border p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <UserRound className="size-3.5" />
                      Assignee
                    </div>

                    <p className="mt-1 text-sm font-medium">
                      {task.assignee
                        ?.fullName ??
                        (task.assigneeId
                          ? "Assigned"
                          : "Unassigned")}
                    </p>

                    {task.assignee
                      ?.email && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {
                          task.assignee
                            .email
                        }
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border p-3 sm:col-span-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Target className="size-3.5" />
                      Sprint
                    </div>

                    <p className="mt-1 text-sm font-medium">
                      {selectedSprint?.name ??
                        (task.sprintId
                          ? "Assigned to sprint"
                          : "No sprint")}
                    </p>
                  </div>
                </div>

                {/* Project */}
                {task.project && (
                  <div className="flex items-center gap-3 rounded-xl border p-4">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FolderKanban className="size-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        Project
                      </p>

                      <p className="truncate text-sm font-medium">
                        {
                          task.project
                            .name
                        }
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {(canUpdate ||
                  canDelete) && (
                  <>
                    <Separator />

                    <div className="flex flex-col gap-2 sm:flex-row">
                      {canUpdate && (
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={
                            handleEditStart
                          }
                        >
                          <Pencil className="mr-2 size-4" />
                          Edit task
                        </Button>
                      )}

                      {canDelete && (
                        <Button
                          type="button"
                          variant="destructive"
                          className="flex-1"
                          onClick={() =>
                            setDeleteDialogOpen(
                              true,
                            )
                          }
                          disabled={
                            deleting
                          }
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete task
                        </Button>
                      )}
                    </div>
                  </>
                )}

                <Separator />

                {/* Comments */}
                <CommentList
                  taskId={task.id}
                  currentUserId={
                    currentUserId
                  }
                  canComment={canComment}
                  canEditAny={
                    canEditAnyComment
                  }
                  canDeleteAny={
                    canDeleteAnyComment
                  }
                />

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="size-3.5" />

                  Created{" "}
                  {new Intl.DateTimeFormat(
                    "en",
                    {
                      dateStyle:
                        "medium",
                    },
                  ).format(
                    new Date(
                      task.createdAt,
                    ),
                  )}
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(value) => {
          if (!deleting) {
            setDeleteDialogOpen(
              value,
            );
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Delete task?
            </DialogTitle>

            <DialogDescription>
              Are you sure you want to
              delete{" "}
              <span className="font-medium text-foreground">
                "{task.title}"
              </span>
              ? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setDeleteDialogOpen(
                  false,
                )
              }
              disabled={deleting}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={() =>
                void handleDelete()
              }
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 size-4" />
                  Delete task
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}