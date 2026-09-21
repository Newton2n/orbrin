import {
  ArrowUpRight,
  CheckCircle2,
  CircleDashed,
  FolderKanban,
  Plus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "../../../actions/auth.action";
import { Badge } from "../../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

const workstreams = [
  {
    name: "Projects",
    href: "/dashboard/projects",
    icon: FolderKanban,
    note: "Initiatives and delivery plans",
  },
  {
    name: "Tasks",
    href: "/dashboard/tasks",
    icon: CheckCircle2,
    note: "Execution across your workspace",
  },
  {
    name: "Team",
    href: "/dashboard/team",
    icon: Users,
    note: "People, roles, and ownership",
  },
];

export default async function DashboardPage() {
  const result = await getCurrentUser();
  const currentUser = result.success ? result.data : null;
  const firstName = (currentUser?.fullName ?? "there").split(" ")[0];
  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <span className="size-2 rounded-full bg-primary" /> Workspace
            overview
          </div>
          <h1 className="font-heading text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Good morning, {firstName}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            A clear view of the work that matters. Connect your workspace data
            to see live delivery signals here.
          </p>
        </div>
        <Link
          href="/dashboard/projects"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus data-icon="inline-start" /> New project
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Active projects", icon: FolderKanban },
          { label: "Open tasks", icon: CircleDashed },
          { label: "Team members", icon: Users },
        ].map(({ label, icon: Icon }) => (
          <Card key={label} className="border-border/70 shadow-none">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="size-4 text-primary" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <p className="font-heading text-3xl font-semibold tracking-tight">
                —
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Awaiting workspace data
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <Card className="border-border/70 shadow-none">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Start with a workstream</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Everything your team needs, in one place.
              </p>
            </div>
            <Badge variant="outline">ORBRIN workspace</Badge>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {workstreams.map(({ name, href, icon: Icon, note }) => (
              <Link
                key={name}
                href={href}
                className="group rounded-lg border border-border/70 bg-background/60 p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
              >
                <Icon className="size-5 text-primary" aria-hidden="true" />
                <p className="mt-8 text-sm font-semibold">
                  {name}
                  <ArrowUpRight className="ml-1 inline size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {note}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-primary text-primary-foreground shadow-none">
          <CardHeader>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">
              Your command center
            </p>
            <CardTitle className="mt-2 text-2xl tracking-tight">
              Make progress visible.
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-primary-foreground/75">
              Projects, tasks, sprints, and people stay connected so your team
              can move with context.
            </p>
            <Link
              href="/dashboard/projects"
              className="mt-6 inline-flex h-9 items-center justify-center gap-2 rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
            >
              Explore projects <ArrowUpRight data-icon="inline-end" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
