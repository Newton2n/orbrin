"use client";

import {
  Bell,
  Check,
  ListChecks,
  Trash2,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

interface Notification {
  id: string;
  type:
    | "TASK_ASSIGNED"
    | "TASK_UPDATED"
    | "COMMENT_ADDED"
    | "SPRINT_STARTED"
    | "SPRINT_COMPLETED"
    | "PROJECT_ACTIVITY"
    | "TEAM_CHANGES";
  title: string;
  description: string;
  user: {
    name: string;
    initials: string;
  };
  timestamp: string;
  read: boolean;
}

const notificationsData: Notification[] = [
  {
    id: "1",
    type: "TASK_ASSIGNED",
    title: "Task assigned to you",
    description: '"Review authentication flow" in Platform Redesign',
    user: { name: "Sarah Chen", initials: "SC" },
    timestamp: "2 minutes ago",
    read: false,
  },
  {
    id: "2",
    type: "COMMENT_ADDED",
    title: "New comment on your task",
    description: 'Alex added a comment to "Dashboard UI"',
    user: { name: "Alex Morgan", initials: "AM" },
    timestamp: "15 minutes ago",
    read: false,
  },
  {
    id: "3",
    type: "SPRINT_STARTED",
    title: "Sprint started",
    description: 'Sprint 14 "Platform" has started',
    user: { name: "Project System", initials: "PS" },
    timestamp: "1 hour ago",
    read: true,
  },
  {
    id: "4",
    type: "TASK_UPDATED",
    title: "Task updated",
    description:
      'Priya changed status to "Review" for "API endpoints"',
    user: { name: "Priya Shah", initials: "PS" },
    timestamp: "3 hours ago",
    read: true,
  },
  {
    id: "5",
    type: "PROJECT_ACTIVITY",
    title: "Project milestone reached",
    description: "Platform Redesign reached 75% completion",
    user: { name: "Project System", initials: "PS" },
    timestamp: "5 hours ago",
    read: true,
  },
];

function getNotificationIcon(type: Notification["type"]) {
  switch (type) {
    case "TASK_ASSIGNED":
      return <AlertCircle className="size-4" />;
    case "TASK_UPDATED":
      return <Check className="size-4" />;
    case "COMMENT_ADDED":
      return <MessageSquare className="size-4" />;
    case "SPRINT_STARTED":
      return <Bell className="size-4" />;
    case "SPRINT_COMPLETED":
      return <CheckCircle2 className="size-4" />;
    case "PROJECT_ACTIVITY":
      return <AlertCircle className="size-4" />;
    case "TEAM_CHANGES":
      return <Users className="size-4" />;
    default:
      return <Bell className="size-4" />;
  }
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "unread"
      ? notificationsData.filter((n) => !n.read)
      : notificationsData;

  const unreadCount = notificationsData.filter((n) => !n.read).length;

  return (
    <section className="space-y-6 max-w-3xl">
      <div>
        <p className="text-sm font-medium text-primary">Workspace</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
          Notifications
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Stay updated with all your workspace activity.
        </p>
      </div>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Select value={filter} onValueChange={(value) => setFilter(value ?? "all")}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All notifications</SelectItem>
            <SelectItem value="unread">Unread only</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm">
              <ListChecks className="mr-2 size-4" /> Mark all as read
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length > 0 ? (
          filtered.map((notification) => (
            <Card
              key={notification.id}
              className={`border-border/70 shadow-none cursor-pointer transition-colors ${
                !notification.read
                  ? "bg-primary/5 hover:bg-primary/10"
                  : "hover:bg-muted/50"
              }`}
            >
              <CardContent className="flex items-start gap-4 p-4">
                <div className="mt-0.5 flex shrink-0 items-center justify-center">
                  <Avatar className="size-9">
                    <AvatarFallback className="text-xs">
                      {notification.user.initials}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {notification.title}
                      </p>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {notification.description}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="mt-1 shrink-0">
                        <div className="size-2 rounded-full bg-primary" />
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {notification.timestamp}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="size-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-border/70 shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="grid size-12 place-items-center rounded-full bg-muted">
                <Bell className="size-5 text-muted-foreground" />
              </div>
              <h3 className="mt-4 font-semibold">All caught up</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You have no unread notifications.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
