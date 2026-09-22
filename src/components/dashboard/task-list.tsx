import { ListTodo } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface DashboardTask {
  title: string;
  project: string;
  priority: string;
  due: string;
  assignee: string;
}

export function TaskList({ tasks }: { tasks: DashboardTask[] }) {
  return (
    <div className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
      {tasks.map((task) => (
        <div
          key={task.title}
          className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
        >
          <div className="grid size-8 shrink-0 place-items-center rounded-md border border-zinc-200 dark:border-zinc-800">
            <ListTodo className="size-4 text-zinc-500 dark:text-zinc-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {task.title}
            </p>
            <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
              {task.project}
            </p>
          </div>
          <div className="hidden text-right sm:block">
            <Badge variant={task.priority === "High" ? "outline" : "secondary"}>
              {task.priority}
            </Badge>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              {task.due}
            </p>
          </div>
          <div className="grid size-7 shrink-0 place-items-center rounded-full bg-zinc-100 text-[10px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {task.assignee}
          </div>
        </div>
      ))}
    </div>
  );
}
