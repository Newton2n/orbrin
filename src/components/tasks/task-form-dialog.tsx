// "use client";

// import { useEffect, useState } from "react";
// import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";

// import {
//   createTask,
//   type Task,
//   type TaskPriority,
//   type TaskStatus,
// } from "@/actions/task.action";
// import { getAllProjects } from "@/actions/project.action";
// import { getOrganizationMembers } from "@/actions/organization.action";

// import { Button } from "@/components/ui/button";
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {cn } from "@/utils/utils"

// type ProjectOption = {
//   id: string;
//   name: string;
// };

// type AssigneeOption = {
//   id: string;
//   fullName: string;
//   email: string;
// };

// type TaskFormDialogProps = {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onCreated: (task: Task) => void;
// };

// export function TaskFormDialog({
//   open,
//   onOpenChange,
//   onCreated,
// }: TaskFormDialogProps) {
//   const [projects, setProjects] = useState<ProjectOption[]>([]);
//   const [assignees, setAssignees] = useState<AssigneeOption[]>([]);

//   const [projectId, setProjectId] = useState("");
//   const [assigneeId, setAssigneeId] = useState("");

//   const [assigneeOpen, setAssigneeOpen] = useState(false);

//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");

//   const [priority, setPriority] = useState<TaskPriority>("MEDIUM");

//   const [status, setStatus] =
//     useState<Extract<TaskStatus, "TODO" | "IN_PROGRESS" | "DONE">>("TODO");

//   const [dueDate, setDueDate] = useState("");

//   const [loadingProjects, setLoadingProjects] = useState(false);

//   const [loadingAssignees, setLoadingAssignees] = useState(false);

//   const [submitting, setSubmitting] = useState(false);

//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!open) {
//       return;
//     }

//     const loadFormData = async () => {
//       setLoadingProjects(true);
//       setLoadingAssignees(true);
//       setError("");

//       try {
//         const [projectsResult, membersResult] = await Promise.all([
//           getAllProjects({
//             page: 1,
//             limit: 100,
//           }),
//           getOrganizationMembers({
//             page: 1,
//             limit: 100,
//             status: "ACTIVE",
//           }),
//         ]);

//         if (!projectsResult.success) {
//           setError(projectsResult.message ?? "Unable to load projects.");
//           return;
//         }

//         if (!membersResult.success) {
//           setError(
//             membersResult.message ?? "Unable to load organization members.",
//           );
//           return;
//         }

//         const projectOptions = projectsResult.data.projects.map((project) => ({
//           id: project.id,
//           name: project.name,
//         }));

//         setProjects(projectOptions);

//         if (projectOptions.length > 0) {
//           setProjectId(projectOptions[0].id);
//         }

//         const assigneeOptions = membersResult.data.items
//           .filter(
//             (member) =>
//               member.status === "ACTIVE" && member.user?.status === "ACTIVE",
//           )
//           .map((member) => ({
//             // IMPORTANT:
//             // Task assigneeId expects user.id,
//             // not organization membership id.
//             id: member.user!.id,
//             fullName: member.user!.fullName,
//             email: member.user!.email,
//           }));

//         setAssignees(assigneeOptions);
//       } catch {
//         setError("Something went wrong while loading task data.");
//       } finally {
//         setLoadingProjects(false);
//         setLoadingAssignees(false);
//       }
//     };

//     void loadFormData();
//   }, [open]);

//   const resetForm = () => {
//     setProjectId("");
//     setAssigneeId("");
//     setAssigneeOpen(false);
//     setTitle("");
//     setDescription("");
//     setPriority("MEDIUM");
//     setStatus("TODO");
//     setDueDate("");
//     setError("");
//   };

//   const selectedAssignee = assignees.find(
//     (assignee) => assignee.id === assigneeId,
//   );

//   const selectedProject = projects.find((project) => project.id === projectId);

//   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();

//     if (!projectId) {
//       setError("Please select a project.");
//       return;
//     }

//     if (!title.trim()) {
//       setError("Task title is required.");
//       return;
//     }

//     setSubmitting(true);
//     setError("");

//     try {
//       const result = await createTask(projectId, {
//         title: title.trim(),
//         description: description.trim() || undefined,
//         priority,
//         status,
//         dueDate: dueDate || undefined,

//         // USER ID, not membership ID.
//         assigneeId: assigneeId || undefined,
//       });

//       if (!result.ok) {
//         setError(result.message ?? "Unable to create task.");
//         return;
//       }

//       onCreated(result.data);
//       resetForm();
//     } catch {
//       setError("Something went wrong while creating the task.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <Dialog
//       open={open}
//       onOpenChange={(value) => {
//         if (!value) {
//           resetForm();
//         }

//         onOpenChange(value);
//       }}
//     >
//       <DialogContent
//         className="
//           w-[calc(100%-2rem)]
//           max-w-lg
//           gap-0
//           overflow-hidden
//           p-0
//           sm:max-h-[90vh]
//         "
//       >
//         <DialogHeader className="border-b px-5 py-4 sm:px-6">
//           <DialogTitle className="text-lg sm:text-xl">Create task</DialogTitle>

//           <DialogDescription className="text-xs sm:text-sm">
//             Create a task and assign it to a project member.
//           </DialogDescription>
//         </DialogHeader>

//         <form
//           onSubmit={handleSubmit}
//           className="flex max-h-[calc(100vh-8rem)] flex-col"
//         >
//           <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
//             {error && (
//               <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
//                 {error}
//               </div>
//             )}

//             {/* Project */}
//             <div className="space-y-2">
//               <Label htmlFor="task-project">Project</Label>

//               <select
//                 id="task-project"
//                 value={projectId}
//                 onChange={(event) => setProjectId(event.target.value)}
//                 disabled={loadingProjects || submitting}
//                 className="
//                   h-10
//                   w-full
//                   rounded-md
//                   border
//                   bg-background
//                   px-3
//                   text-sm
//                   outline-none
//                   transition-colors
//                   focus:border-ring
//                   focus:ring-2
//                   focus:ring-ring/20
//                   disabled:cursor-not-allowed
//                   disabled:opacity-50
//                 "
//               >
//                 <option value="">
//                   {loadingProjects ? "Loading projects..." : "Select project"}
//                 </option>

//                 {projects.map((project) => (
//                   <option key={project.id} value={project.id}>
//                     {project.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Assignee */}
//             <div className="space-y-2">
//               <Label>Assignee</Label>

//               <Popover open={assigneeOpen} onOpenChange={setAssigneeOpen}>
//                 <PopoverTrigger asChild>
//                   <Button
//                     type="button"
//                     variant="outline"
//                     role="combobox"
//                     aria-expanded={assigneeOpen}
//                     disabled={loadingAssignees || submitting}
//                     className="
//                       h-auto
//                       min-h-10
//                       w-full
//                       justify-between
//                       px-3
//                       font-normal
//                     "
//                   >
//                     <div className="min-w-0 flex-1 text-left">
//                       {loadingAssignees ? (
//                         <span className="text-muted-foreground">
//                           Loading members...
//                         </span>
//                       ) : selectedAssignee ? (
//                         <div className="flex min-w-0 flex-col">
//                           <span className="truncate text-sm">
//                             {selectedAssignee.fullName}
//                           </span>

//                           <span className="truncate text-xs text-muted-foreground">
//                             {selectedAssignee.email}
//                           </span>
//                         </div>
//                       ) : (
//                         <span className="text-muted-foreground">
//                           Select assignee
//                         </span>
//                       )}
//                     </div>

//                     <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
//                   </Button>
//                 </PopoverTrigger>

//                 <PopoverContent
//                   align="start"
//                   className="w-[var(--radix-popover-trigger-width)] p-0"
//                 >
//                   <Command>
//                     <CommandInput placeholder="Search member..." />

//                     <CommandList>
//                       <CommandEmpty>No members found.</CommandEmpty>

//                       <CommandGroup>
//                         {/* Unassigned */}
//                         <CommandItem
//                           value="unassigned"
//                           onSelect={() => {
//                             setAssigneeId("");
//                             setAssigneeOpen(false);
//                           }}
//                         >
//                           <Check
//                             className={cn(
//                               "mr-2 size-4",
//                               !assigneeId ? "opacity-100" : "opacity-0",
//                             )}
//                           />

//                           <span>Unassigned</span>
//                         </CommandItem>

//                         {assignees.map((assignee) => (
//                           <CommandItem
//                             key={assignee.id}
//                             value={`${assignee.fullName} ${assignee.email}`}
//                             onSelect={() => {
//                               setAssigneeId(assignee.id);
//                               setAssigneeOpen(false);
//                             }}
//                             className="py-2.5"
//                           >
//                             <Check
//                               className={cn(
//                                 "mr-2 size-4 shrink-0",
//                                 assigneeId === assignee.id
//                                   ? "opacity-100"
//                                   : "opacity-0",
//                               )}
//                             />

//                             <div className="min-w-0">
//                               <p className="truncate text-sm font-medium">
//                                 {assignee.fullName}
//                               </p>

//                               <p className="truncate text-xs text-muted-foreground">
//                                 {assignee.email}
//                               </p>
//                             </div>
//                           </CommandItem>
//                         ))}
//                       </CommandGroup>
//                     </CommandList>
//                   </Command>
//                 </PopoverContent>
//               </Popover>

//               <p className="text-xs text-muted-foreground">
//                 Optional. You can assign this task to an active organization
//                 member.
//               </p>
//             </div>

//             {/* Title */}
//             <div className="space-y-2">
//               <Label htmlFor="task-title">Title</Label>

//               <Input
//                 id="task-title"
//                 value={title}
//                 onChange={(event) => setTitle(event.target.value)}
//                 placeholder="e.g. Implement authentication"
//                 disabled={submitting}
//               />
//             </div>

//             {/* Description */}
//             <div className="space-y-2">
//               <Label htmlFor="task-description">Description</Label>

//               <Textarea
//                 id="task-description"
//                 value={description}
//                 onChange={(event) => setDescription(event.target.value)}
//                 placeholder="Describe what needs to be done..."
//                 disabled={submitting}
//                 rows={4}
//                 className="resize-none"
//               />
//             </div>

//             {/* Status + Priority */}
//             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//               <div className="space-y-2">
//                 <Label htmlFor="task-status">Status</Label>

//                 <select
//                   id="task-status"
//                   value={status}
//                   onChange={(event) =>
//                     setStatus(
//                       event.target.value as Extract<
//                         TaskStatus,
//                         "TODO" | "IN_PROGRESS" | "DONE"
//                       >,
//                     )
//                   }
//                   disabled={submitting}
//                   className="
//                     h-10
//                     w-full
//                     rounded-md
//                     border
//                     bg-background
//                     px-3
//                     text-sm
//                     outline-none
//                     focus:border-ring
//                     focus:ring-2
//                     focus:ring-ring/20
//                   "
//                 >
//                   <option value="TODO">To do</option>

//                   <option value="IN_PROGRESS">In progress</option>

//                   <option value="DONE">Done</option>
//                 </select>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="task-priority">Priority</Label>

//                 <select
//                   id="task-priority"
//                   value={priority}
//                   onChange={(event) =>
//                     setPriority(event.target.value as TaskPriority)
//                   }
//                   disabled={submitting}
//                   className="
//                     h-10
//                     w-full
//                     rounded-md
//                     border
//                     bg-background
//                     px-3
//                     text-sm
//                     outline-none
//                     focus:border-ring
//                     focus:ring-2
//                     focus:ring-ring/20
//                   "
//                 >
//                   <option value="LOW">Low</option>

//                   <option value="MEDIUM">Medium</option>

//                   <option value="HIGH">High</option>

//                   <option value="URGENT">Urgent</option>
//                 </select>
//               </div>
//             </div>

//             {/* Due date */}
//             <div className="space-y-2">
//               <Label htmlFor="task-due-date">Due date</Label>

//               <Input
//                 id="task-due-date"
//                 type="date"
//                 value={dueDate}
//                 onChange={(event) => setDueDate(event.target.value)}
//                 disabled={submitting}
//               />
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="flex shrink-0 justify-end gap-2 border-t bg-background px-5 py-4 sm:px-6">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => onOpenChange(false)}
//               disabled={submitting}
//             >
//               Cancel
//             </Button>

//             <Button
//               type="submit"
//               disabled={
//                 submitting || loadingProjects || loadingAssignees || !projectId
//               }
//             >
//               {submitting ? (
//                 <>
//                   <Loader2 className="mr-2 size-4 animate-spin" />
//                   Creating...
//                 </>
//               ) : (
//                 <>
//                   <Plus className="mr-2 size-4" />
//                   Create task
//                 </>
//               )}
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }
