import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FolderKanban,
  ListTodo,
  MoveUpRight,
  PersonStandingIcon,
  Plus,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import Link from "next/link";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ProjectTable } from "@/components/dashboard/project-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { TaskList } from "@/components/dashboard/task-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { AuthUser } from "@/features/auth/types/auth.types";

// Empty arrays ready for your real data
const projects: any[] = [];
const activities: any[] = [];
const tasks: any[] = [];

function initials(name?: string | null, email?: string) {
  return (name || email || "User")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function SectionHeading({ title, action }: { title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="font-heading text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {title}
      </h2>
      {action && (
        <Link
          href="#"
          className="text-xs font-medium text-zinc-600 hover:underline dark:text-zinc-400"
        >
          {action}
          <ArrowUpRight className="ml-1 inline size-3" />
        </Link>
      )}
    </div>
  );
}

function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

export function AdminDashboard({ user }: { user: AuthUser }) {
  const firstName = (user.fullName || "there").split(" ")[0];
  return (
    <div className="flex flex-col gap-7">
      <PageIntro
        eyebrow="Organization overview"
        title={`Welcome back, ${firstName}`}
        description="Keep your organization aligned and your delivery signals in view."
        action={
          <Button asChild>
            <Link href="/dashboard/admin/projects">
              <Plus data-icon="inline-start" /> New project
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <SectionHeading title="Quick actions" />
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/admin/members">
                <Users data-icon="inline-start" /> Invite members
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/admin/teams">
                <Target data-icon="inline-start" /> Create a team
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/admin/projects">
                <FolderKanban data-icon="inline-start" /> Start a project
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/admin/organization">
                <Sparkles data-icon="inline-start" /> Organization settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function ManagerDashboard({ user }: { user: AuthUser }) {
  const firstName = (user.fullName || "there").split(" ")[0];

  return (
    <div className="flex flex-col gap-7">
      <PageIntro
        eyebrow="Execution workspace"
        title={`Good morning, ${firstName}`}
        description="A focused view of delivery, team capacity, and the work coming next."
        action={
          <Button asChild>
            <Link href="/dashboard/manager/tasks">
              <ListTodo data-icon="inline-start" /> Review tasks
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <SectionHeading title="Quick actions" />
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/manager/projects">
                <FolderKanban data-icon="inline-start" /> Manage projects
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/manager/tasks">
                <ListTodo data-icon="inline-start" /> Assign tasks
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/manager/sprints">
                <Target data-icon="inline-start" /> Plan sprint
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/manager/members">
                <Users data-icon="inline-start" /> Team members
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function MemberDashboard({ user }: { user: AuthUser }) {
  const firstName = (user.fullName || "there").split(" ")[0];
  return (
    <div className="flex flex-col gap-7">
      <PageIntro
        eyebrow="Your work"
        title={`Welcome back, ${firstName}`}
        description="Here is what needs your attention today."
        action={
          <Button asChild>
            <Link href="/dashboard/member/tasks">
              <ListTodo data-icon="inline-start" /> Open my tasks
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <SectionHeading title="Quick actions" />
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/member/tasks">
                <ListTodo data-icon="inline-start" /> View my tasks
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/member/projects">
                <FolderKanban data-icon="inline-start" /> Browse projects
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/member/sprints">
                <Target data-icon="inline-start" /> Current sprint
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/member/notifications">
                <Clock3 data-icon="inline-start" /> Check notifications
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function RoleDashboard({
  role,
  user,
}: {
  role: "ADMIN" | "MANAGER" | "MEMBER";
  user: AuthUser;
}) {
  return (
    <div className="min-h-screen">
      <main>
        {role === "ADMIN" && <AdminDashboard user={user} />}
        {role === "MANAGER" && <ManagerDashboard user={user} />}
        {role === "MEMBER" && <MemberDashboard user={user} />}
      </main>
    </div>
  );
}

export function DashboardPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-7">
      <PageIntro
        eyebrow="Workspace"
        title={title}
        description={description}
        action={
          <Button>
            <Plus data-icon="inline-start" /> Create new
          </Button>
        }
      />
      <Card className="border-border/70 shadow-none">
        <CardContent className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-muted">
            <FolderKanban className="size-5 text-muted-foreground" />
          </div>
          <h2 className="mt-4 font-semibold">Your workspace is ready</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Connect this view to your existing server actions to see live{" "}
            {title.toLowerCase()} here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function UserInitials({ user }: { user: AuthUser }) {
  return <span>{initials(user.fullName, user.email)}</span>;
}

export const dashboardNavigation = {
  ADMIN: [
    { href: "/dashboard/admin", label: "Overview", icon: Sparkles },
    {
      href: "/dashboard/admin/projects",
      label: "Projects",
      icon: FolderKanban,
    },
    { href: "/dashboard/admin/teams", label: "Teams", icon: Users },
    { href: "/dashboard/admin/members", label: "Members", icon: Users },
    { href: "/dashboard/admin/sprints", label: "Sprints", icon: Target },
    { href: "/dashboard/admin/tasks", label: "Tasks", icon: ListTodo },
    {
      href: "/dashboard/admin/subscription",
      label: "Subscription",
      icon: Target,
    },
    {
      href: "/dashboard/admin/organization",
      label: "Organization",
      icon: Target,
    },
    {
      href: "/dashboard/profile",
      label: "User Profile",
      icon: PersonStandingIcon,
    },
  ],
  MANAGER: [
    { href: "/dashboard/manager", label: "Overview", icon: Sparkles },
    {
      href: "/dashboard/manager/projects",
      label: "Projects",
      icon: FolderKanban,
    },
    { href: "/dashboard/manager/teams", label: "Teams", icon: Users },
    { href: "/dashboard/manager/members", label: "Members", icon: Users },
    { href: "/dashboard/manager/tasks", label: "Tasks", icon: ListTodo },
    { href: "/dashboard/manager/sprints", label: "Sprints", icon: Target },
    { href: "/dashboard/manager/activity", label: "Activity", icon: Clock3 },
    {
      href: "/dashboard/profile",
      label: "User Profile",
      icon: PersonStandingIcon,
    },
  ],
  MEMBER: [
    { href: "/dashboard/member", label: "Overview", icon: Sparkles },
    { href: "/dashboard/member/tasks", label: "My tasks", icon: ListTodo },
    {
      href: "/dashboard/member/projects",
      label: "Projects",
      icon: FolderKanban,
    },
    { href: "/dashboard/member/teams", label: "Teams", icon: Users },
    { href: "/dashboard/member/sprints", label: "Sprints", icon: Target },
    
    {
      href: "/dashboard/profile",
      label: "User Profile",
      icon: PersonStandingIcon,
    },
  ],
} as const;

export function UserRoleLabel({ role }: { role: string }) {
  return (
    <span className="text-xs text-muted-foreground">
      {role.charAt(0) + role.slice(1).toLowerCase()}
    </span>
  );
}