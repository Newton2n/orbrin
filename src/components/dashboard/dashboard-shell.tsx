"use client";

import { AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import type { AuthUser, Role } from "@/features/auth/types/auth.types";
import { DashboardHeader } from "./dashboard-header";
import { DashboardSidebar } from "./dashboard-sidebar";

function roleForUser(user: AuthUser): Role {
  return user.memberships[0]?.role ?? "MEMBER";
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

        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
            {/* Not subscribed */}
            {showSubscriptionWarning ? (
              <div className="fixed right-4 top-20 z-50 w-[calc(100%-2rem)] max-w-sm">
                <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-background p-3 shadow-lg">
                  <AlertTriangle
                    className="mt-0.5 size-4 shrink-0 text-amber-500"
                    aria-hidden="true"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      Subscription required
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Your organization is not subscribed. Some features may
                      be restricted.
                    </p>

                    {role === "ADMIN" ? (
                      <Link
                        href="/dashboard/admin/subscription"
                        className="mt-2 inline-block text-xs font-medium text-amber-600 hover:underline dark:text-amber-400"
                      >
                        Subscribe now →
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Subscription expired */}
            {subscriptionExpired && !showSubscriptionWarning ? (
              <div className="fixed right-4 top-20 z-50 w-[calc(100%-2rem)] max-w-sm">
                <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-background p-3 shadow-lg">
                  <Clock
                    className="mt-0.5 size-4 shrink-0 text-red-500"
                    aria-hidden="true"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      Subscription expired
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Your organization subscription has expired. Some
                      features and actions may be restricted.
                    </p>

                    {role === "ADMIN" ? (
                      <Link
                        href="/dashboard/admin/subscription"
                        className="mt-2 inline-block text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                      >
                        Renew subscription →
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}