"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Clock,
  MailWarning,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import type { AuthUser, Role } from "@/features/auth/types/auth.types";
import { DashboardHeader } from "./dashboard-header";
import { DashboardSidebar } from "./dashboard-sidebar";

function roleForUser(user: AuthUser): Role {
  return user.memberships[0]?.role ?? "MEMBER";
}

function FloatingWarning({
  type,
  title,
  description,
  href,
  linkLabel,
}: {
  type: "email" | "subscription" | "expired";
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
}) {
  const [expanded, setExpanded] = useState(true);

  const Icon =
    type === "email"
      ? MailWarning
      : type === "expired"
        ? Clock
        : AlertTriangle;

  const iconClasses =
    type === "email"
      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
      : type === "expired"
        ? "bg-red-500/10 text-red-600 dark:text-red-400"
        : "bg-amber-500/10 text-amber-600 dark:text-amber-400";

  const borderClasses =
    type === "email"
      ? "border-blue-500/25"
      : type === "expired"
        ? "border-red-500/25"
        : "border-amber-500/25";

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        aria-label={`Expand ${title}`}
        title={title}
        className={`self-end flex size-10 cursor-pointer items-center justify-center rounded-full border bg-background/95 shadow-lg backdrop-blur-md transition-transform hover:scale-105 sm:h-auto sm:w-auto sm:rounded-xl sm:px-3 sm:py-2 ${borderClasses}`}
      >
        <Icon className="size-4" aria-hidden="true" />

        <span className="hidden max-w-40 truncate text-xs font-medium text-foreground sm:block pl-1">
          {title}
        </span>

        <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
      </button>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-background/95 shadow-lg shadow-black/5 backdrop-blur-md transition-all duration-300 ${borderClasses}`}
      role="status"
    >
      <div className="flex items-center gap-3 p-3">
        <div
          className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${iconClasses}`}
        >
          <Icon className="size-4" aria-hidden="true" />
        </div>

        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="min-w-0 flex-1 cursor-pointer text-left"
          aria-expanded={expanded}
          aria-controls={`warning-content-${type}`}
        >
          <span className="block truncate text-sm font-semibold text-foreground">
            {title}
          </span>

          <span className="hidden truncate text-xs text-muted-foreground sm:block">
            Tap to collapse
          </span>
        </button>

        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="shrink-0 cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={`Collapse ${title}`}
          aria-expanded={expanded}
          aria-controls={`warning-content-${type}`}
        >
          <ChevronUp className="size-4" />
        </button>
      </div>

      <div
        id={`warning-content-${type}`}
        className="border-t px-3 pb-3 pt-2.5"
      >
        <p className="text-xs leading-5 text-muted-foreground">
          {description}
        </p>

        {href && linkLabel ? (
          <Link
            href={href}
            className="mt-2.5 inline-flex items-center gap-1 rounded-md text-xs font-medium text-foreground transition-colors hover:text-primary hover:underline"
          >
            {linkLabel}
            <ArrowUpRight className="size-3.5" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function DashboardShell({
  children,
  user,
  showSubscriptionWarning,
  subscriptionExpired,
}: {
  children: ReactNode;
  user: AuthUser;
  showSubscriptionWarning: boolean;
  subscriptionExpired: boolean;
}) {
  const role = roleForUser(user);
  const [collapsed, setCollapsed] = useState(false);

  const organization =
    user.memberships[0]?.organization?.name || "Orbrin workspace";

  const emailUnverified = !user.emailVerified;

  const showExpiredWarning =
    subscriptionExpired && !showSubscriptionWarning;

  const showAnyWarning =
    emailUnverified || showSubscriptionWarning || showExpiredWarning;

  return (
    <div className="flex min-h-svh bg-background">
      <DashboardSidebar
        role={role}
        organization={organization}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          user={user}
          role={role}
          organization={organization}
        />

        {showAnyWarning ? (
          <div className="pointer-events-none fixed right-4 top-20 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col items-end gap-3">
            {emailUnverified ? (
              <div className="pointer-events-auto w-full">
                <FloatingWarning
                  type="email"
                  title="Verify your email"
                  description={`Your email address (${user.email}) is not verified. Verify it to access features that require a verified account.`}
                  href="/dashboard/profile"
                  linkLabel="Go to profile"
                />
              </div>
            ) : null}

            {showSubscriptionWarning ? (
              <div className="pointer-events-auto w-full">
                <FloatingWarning
                  type="subscription"
                  title="Subscription required"
                  description="Your organization is not subscribed. Some features may be restricted."
                  href={
                    role === "ADMIN"
                      ? "/dashboard/admin/subscription"
                      : undefined
                  }
                  linkLabel={role === "ADMIN" ? "Subscribe now" : undefined}
                />
              </div>
            ) : null}

            {showExpiredWarning ? (
              <div className="pointer-events-auto w-full">
                <FloatingWarning
                  type="expired"
                  title="Subscription expired"
                  description="Your organization subscription has expired. Some features and actions may be restricted."
                  href={
                    role === "ADMIN"
                      ? "/dashboard/admin/subscription"
                      : undefined
                  }
                  linkLabel={
                    role === "ADMIN" ? "Renew subscription" : undefined
                  }
                />
              </div>
            ) : null}
          </div>
        ) : null}

        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}