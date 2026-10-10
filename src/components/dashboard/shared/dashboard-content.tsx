"use client";

import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FolderKanban,
  ListTodo,
  PersonStandingIcon,
  Plus,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { InviteMembersDialog } from "@/components/dashboard/invite-members-dialog";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthUser } from "@/features/auth/types/auth.types";
import {
  type AdminStats,
  type DashboardReportParams,
  useAdminDashboardStats,
  useDashboardReport,
  useManagerDashboardStats,
  useMemberDashboardStats,
} from "@/hooks/queries/use-dashboard-stats";
import { useUrlQueryState } from "@/hooks/use-url-query-state";
import { useMemo } from "react";

function initials(name?: string | null, email?: string) {
  return (name || email || "User")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatNumber(value: number | undefined | null) {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString()
    : "0";
}

function DashboardLoadingState() {
  const cards = ["teams", "projects", "members", "tasks"];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card} className="rounded-2xl">
          <CardContent className="animate-pulse space-y-4 p-5">
            <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-8 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-3 w-28 rounded bg-zinc-200 dark:bg-zinc-700" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DashboardErrorState({
  message,
  onRetry,
  title = "Unable to load dashboard stats",
}: {
  message: string;
  onRetry: () => void;
  title?: string;
}) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <CircleAlert className="mt-0.5 size-5 text-destructive" />
          <div>
            <p className="text-sm font-medium text-foreground">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
        <Button variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

function dateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function toUtcDayStart(date: string) {
  return new Date(`${date}T00:00:00.000Z`).toISOString();
}

function toUtcDayEnd(date: string) {
  return new Date(`${date}T23:59:59.999Z`).toISOString();
}

function isValidDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function getReportUrlParams(searchParams: {
  get(name: string): string | null;
}) {
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const validFrom = from && !Number.isNaN(Date.parse(from)) ? from : undefined;
  const validTo = to && !Number.isNaN(Date.parse(to)) ? to : undefined;

  if (validFrom && validTo && validFrom > validTo) {
    return {};
  }

  return { from: validFrom, to: validTo };
}

function ReportBreakdowns({ data }: { data: AdminStats }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <BreakdownCard
        title="Tasks by status"
        items={
          Object.entries(data.tasks.byStatus ?? {}) as Array<[string, number]>
        }
      />
      <BreakdownCard
        title="Tasks by priority"
        items={
          Object.entries(data.tasks.byPriority ?? {}) as Array<[string, number]>
        }
      />
      <BreakdownCard
        title="Sprints by status"
        items={
          Object.entries(data.sprints.byStatus ?? {}) as Array<[string, number]>
        }
      />
    </div>
  );
}

function ReportStats({ data }: { data: AdminStats }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total teams"
          value={formatNumber(data.teams.total)}
          detail="In the reporting period"
          icon={Users}
        />
        <StatCard
          label="Total projects"
          value={formatNumber(data.projects.total)}
          detail="In the reporting period"
          icon={FolderKanban}
        />
        <StatCard
          label="Total members"
          value={formatNumber(data.members.total)}
          detail="In the reporting period"
          icon={Users}
        />
        <StatCard
          label="Total tasks"
          value={formatNumber(data.tasks.total)}
          detail="Created in the reporting period"
          icon={ListTodo}
        />
        <StatCard
          label="Completed tasks"
          value={formatNumber(data.tasks.completed)}
          detail="Completed in the reporting period"
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Total sprints"
          value={formatNumber(data.sprints.total)}
          detail="In the reporting period"
          icon={Target}
        />
        <StatCard
          label="Total comments"
          value={formatNumber(data.comments.total)}
          detail="In the reporting period"
          icon={CalendarDays}
        />
        {data.billing && (
          <StatCard
            label="Completed payment amount"
            value={`${data.billing.totalCompletedAmount.toLocaleString()} ${data.billing.currency}`}
            detail={`${formatNumber(data.billing.completedPayments)} completed payments`}
            icon={Sparkles}
            tone="success"
          />
        )}
      </div>
      <ReportBreakdowns data={data} />
    </>
  );
}

function formatReportPeriod(from?: string, to?: string) {
  if (from && to) {
    return `${from} through ${to}`;
  }

  return from ? `From ${from}` : `Through ${to}`;
}

function BreakdownCard({
  title,
  items,
}: {
  title: string;
  items: Array<[string, number]>;
}) {
  return (
    <Card className="border-border/70 shadow-none">
      <CardHeader>
        <SectionHeading title={title} />
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <Badge variant="secondary">{label.replace(/_/g, " ")}</Badge>
            <span className="text-sm font-medium text-foreground">
              {formatNumber(value)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
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
  const organizationId = user.memberships[0]?.organizationId;
  const firstName = (user.fullName || "there").split(" ")[0];

  const { searchParams, updateQuery } = useUrlQueryState();

  const { data, isLoading, error, refetch } = useAdminDashboardStats();

  const initialReportParams = getReportUrlParams(searchParams);

  const [draftFrom, setDraftFrom] = useState(
    () => initialReportParams.from?.slice(0, 10) ?? "",
  );
  const [draftTo, setDraftTo] = useState(
    () => initialReportParams.to?.slice(0, 10) ?? "",
  );

  const [selectedPreset, setSelectedPreset] = useState<
    "7" | "30" | "month" | "all" | null
  >(null);

  const [appliedParams, setAppliedParams] = useState<DashboardReportParams>(
    () => ({
      from: initialReportParams.from,
      to: initialReportParams.to,
    }),
  );

  const {
    data: report,
    isLoading: isReportLoading,
    error: reportError,
    refetch: refetchReport,
  } = useDashboardReport(appliedParams);

  const today = dateInputValue(new Date());

  const validationErrors = useMemo(() => {
    const errors: {
      from?: string;
      to?: string;
      range?: string;
    } = {};

    if (draftFrom && !isValidDateInput(draftFrom)) {
      errors.from =
        "Start date is invalid. Use a valid date in YYYY-MM-DD format.";
    }

    if (draftTo && !isValidDateInput(draftTo)) {
      errors.to = "End date is invalid. Use a valid date in YYYY-MM-DD format.";
    }

    if (draftFrom && draftFrom > today) {
      errors.from = "Start date cannot be in the future.";
    }

    if (draftTo && draftTo > today) {
      errors.to = "End date cannot be in the future.";
    }

    if (
      draftFrom &&
      draftTo &&
      isValidDateInput(draftFrom) &&
      isValidDateInput(draftTo) &&
      draftFrom > draftTo
    ) {
      errors.range =
        "Start date must be earlier than or equal to the end date.";
    }

    return errors;
  }, [draftFrom, draftTo, today]);

  const hasValidationErrors = Boolean(
    validationErrors.from || validationErrors.to || validationErrors.range,
  );

  const hasAppliedFilter = Boolean(appliedParams.from || appliedParams.to);

  const appliedFrom = appliedParams.from?.slice(0, 10) ?? "";
  const appliedTo = appliedParams.to?.slice(0, 10) ?? "";

  const isDraftPending = draftFrom !== appliedFrom || draftTo !== appliedTo;

  useEffect(() => {
    const nextParams = getReportUrlParams(searchParams);

    setDraftFrom(nextParams.from?.slice(0, 10) ?? "");
    setDraftTo(nextParams.to?.slice(0, 10) ?? "");
    setAppliedParams(nextParams);
  }, [searchParams]);

  useEffect(() => {
    if (!draftFrom && !draftTo) {
      setAppliedParams({});

      if (searchParams.has("from") || searchParams.has("to")) {
        updateQuery({ from: null, to: null });
      }

      return;
    }

    if (hasValidationErrors) {
      return;
    }

    const timeoutId = setTimeout(() => {
      const nextFrom = draftFrom ? toUtcDayStart(draftFrom) : null;
      const nextTo = draftTo ? toUtcDayEnd(draftTo) : null;

      setAppliedParams({
        from: nextFrom ?? undefined,
        to: nextTo ?? undefined,
      });

      if (
        searchParams.get("from") !== nextFrom ||
        searchParams.get("to") !== nextTo
      ) {
        updateQuery({
          from: nextFrom,
          to: nextTo,
        });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [draftFrom, draftTo, hasValidationErrors, searchParams, updateQuery]);

  function clearReportFilter() {
    setDraftFrom("");
    setDraftTo("");
    setAppliedParams({});
    setSelectedPreset("all");

    updateQuery({
      from: null,
      to: null,
    });
  }

  function handleManualDateChange(type: "from" | "to", value: string) {
    if (value && value > today) {
      return;
    }

    if (type === "from") {
      setDraftFrom(value);
    } else {
      setDraftTo(value);
    }

    setSelectedPreset(null);
  }

  function selectPreset(preset: "7" | "30" | "month" | "all") {
    setSelectedPreset(preset);

    if (preset === "all") {
      clearReportFilter();
      return;
    }

    const currentDate = new Date();
    const end = dateInputValue(currentDate);

    const start =
      preset === "month"
        ? dateInputValue(
            new Date(
              Date.UTC(
                currentDate.getUTCFullYear(),
                currentDate.getUTCMonth(),
                1,
              ),
            ),
          )
        : dateInputValue(addUtcDays(currentDate, preset === "7" ? -6 : -29));

    setDraftFrom(start);
    setDraftTo(end);
  }

  function getPresetButtonVariant(preset: "7" | "30" | "month" | "all") {
    return selectedPreset === preset ? "default" : "outline";
  }

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
            <InviteMembersDialog organizationId={organizationId} />

            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/admin/members">
                <Users data-icon="inline-start" /> Manage members
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

      <Card className="border-border/70 shadow-none">
        <CardHeader>
          <SectionHeading title="Reports / Date range" />
          <p className="text-sm text-muted-foreground">
            Apply a period to view organization statistics for that date range.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="report-start">Start date</Label>

              <Input
                id="report-start"
                type="date"
                value={draftFrom}
                max={today}
                onChange={(event) =>
                  handleManualDateChange("from", event.target.value)
                }
                aria-invalid={Boolean(validationErrors.from)}
                aria-describedby={
                  validationErrors.from ? "report-start-error" : undefined
                }
              />

              {validationErrors.from && (
                <p id="report-start-error" className="text-sm text-destructive">
                  {validationErrors.from}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-end">End date</Label>

              <Input
                id="report-end"
                type="date"
                value={draftTo}
                max={today}
                onChange={(event) =>
                  handleManualDateChange("to", event.target.value)
                }
                aria-invalid={Boolean(validationErrors.to)}
                aria-describedby={
                  validationErrors.to ? "report-end-error" : undefined
                }
              />

              {validationErrors.to && (
                <p id="report-end-error" className="text-sm text-destructive">
                  {validationErrors.to}
                </p>
              )}
            </div>
          </div>

          {validationErrors.range && (
            <p className="text-sm text-destructive">{validationErrors.range}</p>
          )}

          {!hasValidationErrors && (isDraftPending || isReportLoading) && (
            <p className="text-sm text-muted-foreground">Updating report...</p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={getPresetButtonVariant("7")}
              size="sm"
              onClick={() => selectPreset("7")}
            >
              Last 7 days
            </Button>

            <Button
              type="button"
              variant={getPresetButtonVariant("30")}
              size="sm"
              onClick={() => selectPreset("30")}
            >
              Last 30 days
            </Button>

            <Button
              type="button"
              variant={getPresetButtonVariant("month")}
              size="sm"
              onClick={() => selectPreset("month")}
            >
              This month
            </Button>

            <Button
              type="button"
              variant={getPresetButtonVariant("all")}
              size="sm"
              onClick={() => selectPreset("all")}
            >
              All time
            </Button>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={clearReportFilter}
            disabled={!draftFrom && !draftTo && !hasAppliedFilter}
          >
            Clear filter
          </Button>
        </CardContent>
      </Card>

      {hasAppliedFilter && !hasValidationErrors ? (
        <section className="flex flex-col gap-4">
          <div>
            <SectionHeading title="Filtered report" />
            <p className="mt-1 text-sm text-muted-foreground">
              Showing statistics for the selected period (
              {formatReportPeriod(
                appliedParams.from?.slice(0, 10),
                appliedParams.to?.slice(0, 10),
              )}
              ).
            </p>

            {(draftFrom || draftTo) && (
              <p className="mt-1 text-xs text-muted-foreground">
                Selected dates: {draftFrom || "—"} to {draftTo || "—"}
              </p>
            )}
          </div>

          {isReportLoading && !report ? (
            <DashboardLoadingState />
          ) : reportError ? (
            <DashboardErrorState
              title="Unable to load filtered report"
              message={
                reportError instanceof Error
                  ? reportError.message
                  : "Unable to load the selected report."
              }
              onRetry={() => refetchReport()}
            />
          ) : report ? (
            <ReportStats data={report as AdminStats} />
          ) : null}
        </section>
      ) : isLoading && !data ? (
        <DashboardLoadingState />
      ) : error ? (
        <DashboardErrorState
          message={
            error instanceof Error
              ? error.message
              : "Unable to load dashboard stats."
          }
          onRetry={() => refetch()}
        />
      ) : data ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total teams"
            value={formatNumber(data.teams.total)}
            detail="Across your organization"
            icon={Users}
          />
          <StatCard
            label="Total projects"
            value={formatNumber(data.projects.total)}
            detail="Active and planned work"
            icon={FolderKanban}
          />
          <StatCard
            label="Total members"
            value={formatNumber(data.members.total)}
            detail="People contributing"
            icon={Users}
          />
          <StatCard
            label="Total tasks"
            value={formatNumber(data.tasks.total)}
            detail="Current workload"
            icon={ListTodo}
          />
          <StatCard
            label="Completed tasks"
            value={formatNumber(data.tasks.completed)}
            detail="Finished so far"
            icon={CheckCircle2}
            tone="success"
          />
          <StatCard
            label="Active sprints"
            value={formatNumber(data.sprints.byStatus.ACTIVE)}
            detail="Currently in motion"
            icon={Target}
          />
          <StatCard
            label="Total comments"
            value={formatNumber(data.comments.total)}
            detail="Cross-team discussion"
            icon={CalendarDays}
          />
          <StatCard
            label="Completed payment amount"
            value={`${data.billing.totalCompletedAmount.toLocaleString()} ${data.billing.currency}`}
            detail={`${data.billing.completedPayments} completed of ${data.billing.totalPayments} payments`}
            icon={Sparkles}
            tone="success"
          />
        </div>
      ) : null}
    </div>
  );
}

export function ManagerDashboard({ user }: { user: AuthUser }) {
  const firstName = (user.fullName || "there").split(" ")[0];
  const { data, isLoading, error, refetch } = useManagerDashboardStats();
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

      {isLoading && !data ? (
        <DashboardLoadingState />
      ) : error ? (
        <DashboardErrorState
          message={
            error instanceof Error
              ? error.message
              : "Unable to load dashboard stats."
          }
          onRetry={() => refetch()}
        />
      ) : data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total teams"
              value={formatNumber(data.teams.total)}
              detail="Teams in your org"
              icon={Users}
            />
            <StatCard
              label="Total projects"
              value={formatNumber(data.projects.total)}
              detail="Portfolio health"
              icon={FolderKanban}
            />
            <StatCard
              label="Total members"
              value={formatNumber(data.members.total)}
              detail="Active contributors"
              icon={Users}
            />
            <StatCard
              label="Total tasks"
              value={formatNumber(data.tasks.total)}
              detail="Across the org"
              icon={ListTodo}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <BreakdownCard
              title="Task status"
              items={
                Object.entries(data.tasks.byStatus ?? {}) as Array<
                  [string, number]
                >
              }
            />
            <BreakdownCard
              title="Task priority"
              items={
                Object.entries(data.tasks.byPriority ?? {}) as Array<
                  [string, number]
                >
              }
            />
            <BreakdownCard
              title="Sprint status"
              items={
                Object.entries(data.sprints.byStatus ?? {}) as Array<
                  [string, number]
                >
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Completed tasks"
              value={formatNumber(data.tasks.completed)}
              detail="Finished work"
              icon={CheckCircle2}
              tone="success"
            />
            <StatCard
              label="Total sprints"
              value={formatNumber(data.sprints.total)}
              detail="Program cadence"
              icon={Target}
            />
            <StatCard
              label="Total comments"
              value={formatNumber(data.comments.total)}
              detail="Team feedback"
              icon={CalendarDays}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

export function MemberDashboard({ user }: { user: AuthUser }) {
  const firstName = (user.fullName || "there").split(" ")[0];
  const { data, isLoading, error, refetch } = useMemberDashboardStats();

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
          </CardContent>
        </Card>
      </div>

      {isLoading && !data ? (
        <DashboardLoadingState />
      ) : error ? (
        <DashboardErrorState
          message={
            error instanceof Error
              ? error.message
              : "Unable to load dashboard stats."
          }
          onRetry={() => refetch()}
        />
      ) : data ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Assigned tasks"
            value={formatNumber(data.tasks.total)}
            detail="Your active workload"
            icon={ListTodo}
          />
          <StatCard
            label="To-dos"
            value={formatNumber(data.tasks.todo)}
            detail="Ready to start"
            icon={Target}
          />
          <StatCard
            label="In progress"
            value={formatNumber(data.tasks.inProgress)}
            detail="Currently moving"
            icon={CalendarDays}
          />
          <StatCard
            label="In review"
            value={formatNumber(data.tasks.inReview)}
            detail="Awaiting feedback"
            icon={Clock3}
          />
          <StatCard
            label="Completed"
            value={formatNumber(data.tasks.completed)}
            detail="Closed successfully"
            icon={CheckCircle2}
            tone="success"
          />
          {typeof data.tasks.overdue === "number" ? (
            <StatCard
              label="Overdue"
              value={formatNumber(data.tasks.overdue)}
              detail="Past due"
              icon={CircleAlert}
              tone="warning"
            />
          ) : null}
          <StatCard
            label="Projects"
            value={formatNumber(data.projects.total)}
            detail="Assigned to you"
            icon={FolderKanban}
          />
          <StatCard
            label="Comments authored"
            value={formatNumber(data.comments.totalAuthored)}
            detail="Your discussion count"
            icon={Sparkles}
          />
        </div>
      ) : null}
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
