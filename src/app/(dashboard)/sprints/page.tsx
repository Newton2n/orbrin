"use client";

import {
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  CalendarDays,
  ListTodo,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Input } from "../../../components/ui/input";
import { Progress } from "../../../components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

const sprintsData = [
  {
    id: "1",
    name: "Sprint 14 - Platform",
    project: "Platform Redesign",
    status: "ACTIVE",
    startDate: "2024-09-09",
    endDate: "2024-09-22",
    progress: 68,
    taskCount: 25,
    completedTasks: 17,
  },
  {
    id: "2",
    name: "Sprint 08 - Growth",
    project: "Mobile Experience",
    status: "ACTIVE",
    startDate: "2024-09-09",
    endDate: "2024-09-26",
    progress: 42,
    taskCount: 20,
    completedTasks: 8,
  },
  {
    id: "3",
    name: "Sprint 21 - API",
    project: "API Modernization",
    status: "PLANNING",
    startDate: "2024-09-23",
    endDate: "2024-10-06",
    progress: 0,
    taskCount: 35,
    completedTasks: 0,
  },
  {
    id: "4",
    name: "Sprint 13 - Infrastructure",
    project: "Platform Redesign",
    status: "COMPLETED",
    startDate: "2024-08-26",
    endDate: "2024-09-08",
    progress: 100,
    taskCount: 18,
    completedTasks: 18,
  },
];

export default function SprintsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = sprintsData.filter((sprint) => {
    const matchesSearch = sprint.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "all" || sprint.status === status;
    return matchesSearch && matchesStatus;
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Execution workspace</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
            Sprints
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Plan and track your team's work in structured cycles.
          </p>
        </div>
        <Button>
          <Plus /> Create Sprint
        </Button>
      </div>

      <Card className="border-border/70 shadow-none">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sprints..."
              />
            </div>
            <Select value={status} onValueChange={(value) => setStatus(value ?? "all")}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="PLANNING">Planning</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {filtered.length > 0 ? (
          filtered.map((sprint) => (
            <Card
              key={sprint.id}
              className="border-border/70 shadow-none hover:bg-muted/30 transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{sprint.name}</CardTitle>
                      <Badge
                        variant={
                          sprint.status === "ACTIVE"
                            ? "secondary"
                            : sprint.status === "COMPLETED"
                              ? "default"
                              : "outline"
                        }
                      >
                        {sprint.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {sprint.project}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Sprint</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 size-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{sprint.progress}%</span>
                  </div>
                  <Progress value={sprint.progress} className="h-1.5" />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Start</p>
                    <p className="mt-1 font-medium">
                      {new Date(sprint.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">End</p>
                    <p className="mt-1 font-medium">
                      {new Date(sprint.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 border-t border-border/70 pt-3">
                  <div className="flex items-center gap-1 text-xs">
                    <ListTodo className="size-3.5 text-muted-foreground" />
                    <span>
                      {sprint.completedTasks} / {sprint.taskCount}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full border-border/70 shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="grid size-12 place-items-center rounded-full bg-muted">
                <CalendarDays className="size-5 text-muted-foreground" />
              </div>
              <h3 className="mt-4 font-semibold">No sprints found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your first sprint to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
