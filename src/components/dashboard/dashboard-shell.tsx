"use client";

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
}: {
  children: ReactNode;
  user: AuthUser;
}) {
  const role = roleForUser(user);
  const [collapsed, setCollapsed] = useState(false);
  const organization =
    user.memberships[0]?.organization?.name || "Orbrin workspace";

  return (
    <div className="flex min-h-svh bg-zinc-50/50 dark:bg-zinc-950">
      <DashboardSidebar
        role={role}
        organization={organization}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader user={user} role={role} organization={organization} />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
