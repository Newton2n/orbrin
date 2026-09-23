"use client";

import { ChevronLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Role } from "@/features/auth/types/auth.types";
import { cn } from "@/utils/utils";
import { NavLinks } from "./nav-links";

export function DashboardSidebar({
  role,
  organization,
  collapsed,
  onToggle,
}: {
  role: Role;
  organization: string;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex",
        collapsed ? "w-20" : "w-64",
      )}
      aria-label="Workspace navigation"
    >
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="grid size-8 shrink-0 place-items-center rounded-md bg-zinc-900 font-heading font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
          O
        </div>
        {!collapsed && (
          <span className="font-heading text-lg font-semibold tracking-tight">
            Orbrin
          </span>
        )}
      </div>
      <div className="border-b border-sidebar-border p-3">
        <div
          className={cn(
            "flex items-center gap-2 rounded-md p-2",
            collapsed && "justify-center",
          )}
        >
          <div className="grid size-7 shrink-0 place-items-center rounded bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
            {organization.slice(0, 1).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{organization}</p>
              <p className="text-[11px] text-sidebar-foreground/60">
                {role.toLowerCase()} workspace
              </p>
            </div>
          )}
        </div>
      </div>
      <NavLinks role={role} collapsed={collapsed} />
      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
          onClick={onToggle}
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
        >
          {collapsed ? (
            <Menu />
          ) : (
            <>
              <ChevronLeft /> Collapse
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
