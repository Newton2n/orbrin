import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FolderKanban,
  ListTodo,
  MoveUpRight,
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

const projects = [
  {
    name: "Platform redesign",
    team: "Product",
    progress: 72,
    status: "On track",
    tasks: "18 / 25",
  },
  {
    name: "Mobile experience",
    team: "Growth",
    progress: 45,
    status: "At risk",
    tasks: "9 / 20",
  },
  {
    name: "API modernization",
    team: "Engineering",
    progress: 88,
    status: "On track",
    tasks: "31 / 35",
  },
];

const activities = [
  {
    name: "Newton",
    action: "created project “Platform redesign”",
    time: "2 minutes ago",
    initials: "NW",
  },
  {
    name: "Sarah Chen",
    action: "moved “Authentication flow” to Review",
    time: "15 minutes ago",
    initials: "SC",
  },
  {
    name: "Alex Morgan",
    action: "completed “Dashboard UI”",
    time: "1 hour ago",
    initials: "AM",
  },
  {
    name: "Priya Shah",
    action: "joined the Product team",
    time: "3 hours ago",
    initials: "PS",
  },
];

const tasks = [
  {
    title: "Review onboarding flow",
    project: "Platform redesign",
    priority: "High",
    due: "Today",
    assignee: "SC",
  },
  {
    title: "Write API documentation",
    project: "API modernization",
    priority: "Medium",
    due: "Tomorrow",
    assignee: "AM",
  },
  {
    title: "QA mobile navigation",
    project: "Mobile experience",
    priority: "Low",
    due: "Fri, Sep 26",
    assignee: "PS",
  },
];

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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total members"
          value="24"
          detail="3 pending invitations"
          icon={Users}
        />
        <StatCard
          label="Active teams"
          value="6"
          detail="Across 4 departments"
          icon={Users}
        />
        <StatCard
          label="Active projects"
          value="8"
          detail="2 need attention"
          icon={FolderKanban}
          tone="warning"
        />
        <StatCard
          label="Tasks completed"
          value="142"
          detail="+18% from last month"
          icon={CheckCircle2}
          tone="success"
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <SectionHeading
              title="Project overview"
              action="View all projects"
            />
          </CardHeader>
          <CardContent>
            <ProjectTable projects={projects} />
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <SectionHeading title="Subscription" action="Manage" />
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-primary p-4 text-primary-foreground">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Growth plan</p>
                <Badge className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">
                  Active
                </Badge>
              </div>
              <p className="mt-5 text-2xl font-semibold">18 / 50 seats</p>
              <Progress
                value={36}
                className="mt-3 bg-primary-foreground/20 [&>div]:bg-primary-foreground"
              />
              <p className="mt-3 text-xs text-primary-foreground/70">
                Renews on October 12, 2026
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Monthly spend</span>
              <span className="font-medium">$240.00</span>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <SectionHeading title="Recent activity" action="See all activity" />
          </CardHeader>
          <CardContent>
            <ActivityFeed activities={activities} />
          </CardContent>
        </Card>
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
              <Link href="/dashboard/admin/settings">
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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active projects"
          value="8"
          detail="2 approaching milestones"
          icon={FolderKanban}
        />
        <StatCard
          label="Open tasks"
          value="47"
          detail="12 due this week"
          icon={ListTodo}
        />
        <StatCard
          label="Overdue tasks"
          value="5"
          detail="3 need reassignment"
          icon={CircleAlert}
          tone="warning"
        />
        <StatCard
          label="Upcoming deadlines"
          value="12"
          detail="Next 14 days"
          icon={CalendarDays}
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <SectionHeading title="Project progress" action="Open projects" />
          </CardHeader>
          <CardContent>
            <ProjectTable projects={projects} compact />
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <SectionHeading title="Active sprints" action="View sprints" />
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {[
              {
                name: "Sprint 14 · Platform",
                progress: 68,
                meta: "Ends in 3 days",
              },
              {
                name: "Sprint 08 · Growth",
                progress: 42,
                meta: "Ends in 8 days",
              },
              {
                name: "Sprint 21 · API",
                progress: 91,
                meta: "Ends tomorrow",
              },
            ].map((sprint) => (
              <div key={sprint.name}>
                <div className="flex justify-between gap-3 text-sm">
                  <span className="font-medium">{sprint.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {sprint.progress}%
                  </span>
                </div>
                <Progress value={sprint.progress} className="mt-2 h-1.5" />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {sprint.meta}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <SectionHeading title="Team workload" action="Manage teams" />
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {[
              { name: "Product", count: "18 tasks", load: 72 },
              { name: "Engineering", count: "31 tasks", load: 88 },
              { name: "Growth", count: "12 tasks", load: 48 },
            ].map((team) => (
              <div key={team.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{team.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {team.count}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <Progress value={team.load} className="h-1.5" />
                  <span className="w-8 text-right text-xs text-muted-foreground">
                    {team.load}%
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <SectionHeading title="Upcoming deadlines" action="See calendar" />
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border/70">
            {tasks.map((task) => (
              <div
                key={task.title}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="grid size-8 place-items-center rounded-md bg-muted">
                  <Clock3 className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.project}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {task.due}
                </span>
              </div>
            ))}
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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="My open tasks"
          value="12"
          detail="4 due this week"
          icon={ListTodo}
        />
        <StatCard
          label="Due soon"
          value="4"
          detail="2 due today"
          icon={Clock3}
          tone="warning"
        />
        <StatCard
          label="Completed"
          value="36"
          detail="+6 this week"
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Current sprint"
          value="68%"
          detail="Sprint 14 · 3 days left"
          icon={Target}
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <SectionHeading title="My tasks" action="View all tasks" />
          </CardHeader>
          <CardContent>
            <TaskList tasks={tasks} />
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <SectionHeading title="Current sprint" action="Open sprint" />
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">Sprint 14 · Platform</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ends September 25
                </p>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
            <div className="mt-6 flex items-end justify-between">
              <p className="font-heading text-4xl font-semibold">
                68<span className="text-lg text-muted-foreground">%</span>
              </p>
              <p className="text-xs text-muted-foreground">17 of 25 tasks</p>
            </div>
            <Progress value={68} className="mt-3" />
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              You are on track. Finish the authentication review to keep the
              sprint moving.
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <SectionHeading title="My projects" action="View projects" />
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {projects.slice(0, 2).map((project) => (
              <Link
                href="/dashboard/member/projects"
                key={project.name}
                className="rounded-lg border border-border/70 p-4 transition-colors hover:border-primary/40 hover:bg-muted/30"
              >
                <div className="flex items-center justify-between gap-2">
                  <FolderKanban className="size-4 text-primary" />
                  <MoveUpRight className="size-3 text-muted-foreground" />
                </div>
                <p className="mt-6 truncate text-sm font-medium">
                  {project.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {project.progress}% complete
                </p>
                <Progress value={project.progress} className="mt-3 h-1.5" />
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <SectionHeading title="Recent activity" action="Notifications" />
          </CardHeader>
          <CardContent>
            <ActivityFeed activities={activities} />
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
    { href: "/dashboard/admin/activity", label: "Activity", icon: Clock3 },
    {
      href: "/dashboard/admin/subscription",
      label: "Subscription",
      icon: Target,
    },
    { href: "/dashboard/admin/settings", label: "Settings", icon: Target },
  ],
  MANAGER: [
    { href: "/dashboard/manager", label: "Overview", icon: Sparkles },
    {
      href: "/dashboard/manager/projects",
      label: "Projects",
      icon: FolderKanban,
    },
    { href: "/dashboard/manager/teams", label: "Teams", icon: Users },
    { href: "/dashboard/manager/tasks", label: "Tasks", icon: ListTodo },
    { href: "/dashboard/manager/sprints", label: "Sprints", icon: Target },
    { href: "/dashboard/manager/activity", label: "Activity", icon: Clock3 },
  ],
  MEMBER: [
    { href: "/dashboard/member", label: "Overview", icon: Sparkles },
    { href: "/dashboard/member/tasks", label: "My tasks", icon: ListTodo },
    {
      href: "/dashboard/member/projects",
      label: "Projects",
      icon: FolderKanban,
    },
    { href: "/dashboard/member/sprints", label: "Sprints", icon: Target },
    {
      href: "/dashboard/member/notifications",
      label: "Notifications",
      icon: Clock3,
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
