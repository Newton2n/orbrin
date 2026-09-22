import { ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";

export function DashboardPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.04em]">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  tone = "default",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "warning" | "success";
}) {
  return (
    <Card className="border-border/70 shadow-none">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 font-heading text-3xl font-semibold tracking-tight">
              {value}
            </p>
          </div>
          <div
            className={[
              "grid size-9 place-items-center rounded-md",
              tone === "warning"
                ? "bg-accent text-accent-foreground"
                : tone === "success"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground",
            ].join(" ")}
          >
            <span className="text-xs font-semibold">{value[0] ?? "•"}</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

export function SectionCard({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className ?? "border-border/70 shadow-none"}>
      <CardHeader className="flex-row items-center justify-between gap-4">
        <CardTitle>{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const normalized = value.toUpperCase().replace(/\s+/g, "_");
  const variantMap: Record<
    string,
    "default" | "secondary" | "outline" | "destructive"
  > = {
    TODO: "secondary",
    IN_PROGRESS: "default",
    REVIEW: "outline",
    DONE: "secondary",
    ACTIVE: "default",
    PLANNING: "secondary",
    COMPLETED: "secondary",
    ARCHIVED: "outline",
    OVERDUE: "destructive",
    HIGH: "outline",
    MEDIUM: "default",
    LOW: "secondary",
    URGENT: "destructive",
  };

  return <Badge variant={variantMap[normalized] ?? "secondary"}>{value}</Badge>;
}

export function PriorityBadge({ value }: { value: string }) {
  return <StatusBadge value={value} />;
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Progress</span>
        <span>{value}%</span>
      </div>
      <Progress value={value} className="h-1.5" />
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  href,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  href?: string;
}) {
  const content = (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 p-10 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <Plus className="size-4" />
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
      {actionLabel ? (
        <Button className="mt-4" asChild>
          <Link href={href ?? "#"}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );

  return content;
}

export function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
    >
      {label}
      <ArrowUpRight className="size-3.5" />
    </Link>
  );
}
