import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const notifications = [
  {
    title: "Task assigned",
    description: "You were assigned to Review authentication flow",
    time: "5 minutes ago",
    unread: true,
  },
  {
    title: "Sprint started",
    description: "Sprint 14 is now active for Platform redesign",
    time: "1 hour ago",
    unread: true,
  },
  {
    title: "Comment added",
    description: "Priya left a note on your task",
    time: "Today",
    unread: false,
  },
];

export default function MemberNotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Alerts
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.04em]">
            Notifications
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Stay on top of the updates that matter to you.
          </p>
        </div>
        <Button variant="outline">
          <CheckCheck className="size-3.5" /> Mark all read
        </Button>
      </div>

      <Card className="border-border/70 shadow-none">
        <CardContent className="p-0">
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.title + notification.time}
                className="flex items-start gap-4 px-6 py-5"
              >
                <div className="grid size-9 place-items-center rounded-full bg-muted">
                  <Bell className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium">{notification.title}</p>
                    {notification.unread ? (
                      <span className="size-2 rounded-full bg-primary" />
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {notification.description}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {notification.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
