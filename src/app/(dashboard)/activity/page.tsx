"use client";

import { Calendar, Clock3 } from "lucide-react";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Card, CardContent } from "../../../components/ui/card";

interface ActivityItem {
  id: string;
  user: {
    name: string;
    initials: string;
  };
  action: string;
  resource: string;
  resourceType:
    | "project"
    | "task"
    | "sprint"
    | "team"
    | "member"
    | "comment";
  timestamp: string;
}

const activityData: ActivityItem[] = [
  {
    id: "1",
    user: { name: "Newton Williams", initials: "NW" },
    action: "created project",
    resource: "Platform Redesign",
    resourceType: "project",
    timestamp: "2 minutes ago",
  },
  {
    id: "2",
    user: { name: "Sarah Chen", initials: "SC" },
    action: "moved",
    resource: "Authentication flow",
    resourceType: "task",
    timestamp: "15 minutes ago",
  },
  {
    id: "3",
    user: { name: "Alex Morgan", initials: "AM" },
    action: "completed",
    resource: "Dashboard UI",
    resourceType: "task",
    timestamp: "1 hour ago",
  },
  {
    id: "4",
    user: { name: "Priya Shah", initials: "PS" },
    action: "joined the",
    resource: "Product team",
    resourceType: "team",
    timestamp: "3 hours ago",
  },
  {
    id: "5",
    user: { name: "David Lee", initials: "DL" },
    action: "added comment to",
    resource: "API endpoints",
    resourceType: "comment",
    timestamp: "5 hours ago",
  },
  {
    id: "6",
    user: { name: "Newton Williams", initials: "NW" },
    action: "started",
    resource: "Sprint 14",
    resourceType: "sprint",
    timestamp: "1 day ago",
  },
  {
    id: "7",
    user: { name: "Sarah Chen", initials: "SC" },
    action: "invited",
    resource: "Jane Smith",
    resourceType: "member",
    timestamp: "2 days ago",
  },
  {
    id: "8",
    user: { name: "Alex Morgan", initials: "AM" },
    action: "updated",
    resource: "Mobile Experience",
    resourceType: "project",
    timestamp: "3 days ago",
  },
];

export default function ActivityPage() {
  return (
    <section className="space-y-6 max-w-3xl">
      <div>
        <p className="text-sm font-medium text-primary">Organization</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
          Activity
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          See what&apos;s happening across your organization.
        </p>
      </div>

      <div className="space-y-3">
        {activityData.map((activity, index) => (
          <div key={activity.id} className="relative">
            {index !== activityData.length - 1 && (
              <div className="absolute left-5 top-11 h-8 w-px bg-border/70" />
            )}
            <div className="flex gap-4">
              <Avatar className="mt-1 shrink-0">
                <AvatarFallback className="text-xs">
                  {activity.user.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 pt-1">
                <p className="text-sm">
                  <span className="font-semibold">{activity.user.name}</span>
                  {" "}{activity.action}{" "}
                  <span className="font-medium text-foreground">
                    {activity.resource}
                  </span>
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock3 className="size-3" />
                  {activity.timestamp}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activityData.length === 0 && (
        <Card className="border-border/70 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="grid size-12 place-items-center rounded-full bg-muted">
              <Calendar className="size-5 text-muted-foreground" />
            </div>
            <h3 className="mt-4 font-semibold">No activity yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Activity will appear here as you work.
            </p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
