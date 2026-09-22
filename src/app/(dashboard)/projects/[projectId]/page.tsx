"use client";

import {
  Calendar,
  Edit,
  FolderKanban,
  Link as LinkIcon,
  MoreHorizontal,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import type { AuthUser } from "../../../../features/auth/types/auth.types";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Progress } from "../../../../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";

interface ProjectDetailsPageProps {
  params: Promise<{ projectId: string }>;
}

const projectData = {
  id: "1",
  name: "Platform Redesign",
  description: "Complete overhaul of the platform interface and user experience",
  status: "IN_PROGRESS",
  startDate: "2024-09-01",
  deadline: "2024-12-15",
  progress: 72,
  teams: ["Product", "Design", "Engineering"],
  taskCounts: {
    total: 25,
    todo: 4,
    inProgress: 10,
    review: 3,
    done: 8,
  },
};

function ProjectHeader({ project }: { project: typeof projectData }) {
  return (
    <div className="space-y-4 border-b border-border/70 pb-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-3xl font-semibold tracking-tight">
              {project.name}
            </h1>
            <Badge
              variant={
                project.status === "IN_PROGRESS"
                  ? "secondary"
                  : project.status === "COMPLETED"
                    ? "default"
                    : "outline"
              }
            >
              {project.status.replace("_", " ")}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {project.description}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit className="mr-2 size-4" /> Edit Project
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 size-4" /> Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Start Date</p>
          <p className="mt-1 text-sm font-medium">
            {new Date(project.startDate).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Deadline</p>
          <p className="mt-1 text-sm font-medium">
            {new Date(project.deadline).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Teams</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {project.teams.map((team) => (
              <Badge key={team} variant="outline">
                {team}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectOverviewTab({ project }: { project: typeof projectData }) {
  return (
    <div className="space-y-6">
      <Card className="border-border/70 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Overall</span>
              <span className="text-muted-foreground">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="mt-2" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Todo", value: project.taskCounts.todo, color: "bg-muted" },
              {
                label: "In Progress",
                value: project.taskCounts.inProgress,
                color: "bg-blue-500",
              },
              {
                label: "Review",
                value: project.taskCounts.review,
                color: "bg-amber-500",
              },
              {
                label: "Done",
                value: project.taskCounts.done,
                color: "bg-green-500",
              },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border border-border/70 p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <div className="mt-2 flex items-end gap-2">
                  <p className="font-heading text-2xl font-semibold">
                    {stat.value}
                  </p>
                  <div
                    className={`h-1.5 w-8 rounded-full ${stat.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Description
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                {project.description}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Status</p>
              <Badge className="mt-2" variant="outline">
                {project.status.replace("_", " ")}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline">
              <Plus className="mr-2 size-4" /> Create Task
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Plus className="mr-2 size-4" /> Create Sprint
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProjectDetailsPage({
  params,
}: ProjectDetailsPageProps) {
  return (
    <div className="space-y-6">
      <ProjectHeader project={projectData} />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ProjectOverviewTab project={projectData} />
        </TabsContent>

        <TabsContent value="board" className="space-y-6">
          <Card className="border-border/70 shadow-none">
            <CardContent className="flex min-h-96 flex-col items-center justify-center p-8 text-center">
              <div className="grid size-12 place-items-center rounded-full bg-muted">
                <FolderKanban className="size-5 text-muted-foreground" />
              </div>
              <h3 className="mt-4 font-semibold">Kanban Board</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Connect this to your task data to see the Kanban board.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card className="border-border/70 shadow-none">
            <CardContent className="flex min-h-96 flex-col items-center justify-center p-8 text-center">
              <div className="grid size-12 place-items-center rounded-full bg-muted">
                <FolderKanban className="size-5 text-muted-foreground" />
              </div>
              <h3 className="mt-4 font-semibold">Project Tasks</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Connect this to your task data to see project tasks.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
