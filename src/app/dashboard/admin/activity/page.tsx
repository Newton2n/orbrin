import { Activity, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const activity = [
  {
    user: "Newton",
    action: "created project",
    resource: "Platform redesign",
    time: "2 minutes ago",
  },
  {
    user: "Sarah Chen",
    action: "updated task",
    resource: "Authentication flow",
    time: "18 minutes ago",
  },
  {
    user: "Alex Morgan",
    action: "completed sprint",
    resource: "Sprint 14",
    time: "1 hour ago",
  },
  {
    user: "Priya Shah",
    action: "commented on",
    resource: "Review onboarding flow",
    time: "3 hours ago",
  },
];

export default function AdminActivityPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Signals
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.04em]">
          Activity
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A timeline of meaningful updates across the workspace.
        </p>
      </div>

      <Card className="border-border/70 shadow-none">
        <CardContent className="p-0">
          <div className="divide-y">
            {activity.map((item) => (
              <div
                key={item.user + item.resource + item.time}
                className="flex items-center gap-4 px-6 py-5"
              >
                <div className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
                  <Activity className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{item.user}</span>{" "}
                    {item.action}{" "}
                    <span className="font-medium text-foreground">
                      {item.resource}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.time}
                  </p>
                </div>
                <Link
                  href="#"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  View <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
