"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/features/auth/types/auth.types";
import { cn } from "@/utils/utils";
import { dashboardNavigation } from "./shared/dashboard-content";

export function NavLinks({
  role,
  collapsed = false,
  onNavigate,
}: {
  role: Role;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Primary">
      {dashboardNavigation[role].map(({ href, label, icon: Icon }) => {
        const active =
          pathname === href ||
          (href !== `/dashboard/${role.toLowerCase()}` &&
            pathname.startsWith(`${href}/`));

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            title={collapsed ? label : undefined}
            className={cn(
              "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              collapsed && "justify-center px-0",
            )}
          >
            <Icon aria-hidden="true" />
            {!collapsed && label}
          </Link>
        );
      })}
    </nav>
  );
}
