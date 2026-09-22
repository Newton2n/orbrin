"use client";

import {
  Bell,
  ChevronDown,
  ChevronLeft,
  Command as CommandIcon,
  Menu,
  Search,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { logout } from "../actions/auth.action";
import type { AuthUser, Role } from "../features/auth/types/auth.types";
import { cn } from "../utils/utils";
import { ThemeToggle } from "./theme-toggle";
import {
  dashboardNavigation,
  UserRoleLabel,
  UserInitials,
} from "./dashboard-content";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "./ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";

function roleForUser(user: AuthUser): Role {
  return user.memberships[0]?.role ?? "MEMBER";
}

function Navigation({
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
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
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

function UserMenu({ user, role }: { user: AuthUser; role: Role }) {
  const label = user.fullName || user.email || "Account";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-9 items-center gap-2 rounded-md px-2 text-sm font-medium hover:bg-accent"
        aria-label="Open account menu"
      >
        <Avatar className="size-8">
          <AvatarFallback>
            <UserInitials user={user} />
          </AvatarFallback>
        </Avatar>
        <span className="hidden max-w-32 truncate sm:inline">{label}</span>
        <ChevronDown
          className="size-3.5 text-muted-foreground"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-medium">{label}</p>
          <UserRoleLabel role={role} />
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            window.location.href = `/dashboard/${role.toLowerCase()}/settings`;
          }}
        >
          Profile & settings
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            void logout();
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
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
  const [commandOpen, setCommandOpen] = useState(false);
  const pathname = usePathname();
  const current =
    dashboardNavigation[role].find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    ) ?? dashboardNavigation[role][0];
  const organization =
    user.memberships[0]?.organization?.name || "Orbrin workspace";
  const openCommand = () => setCommandOpen(true);
  return (
    <div className="flex min-h-svh bg-background">
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex",
          collapsed ? "w-20" : "w-64",
        )}
        aria-label="Workspace navigation"
      >
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
          <div className="grid size-8 shrink-0 place-items-center rounded-md bg-sidebar-primary font-heading font-bold text-sidebar-primary-foreground">
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
            <div className="grid size-7 shrink-0 place-items-center rounded bg-sidebar-accent text-xs font-semibold">
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
        <Navigation role={role} collapsed={collapsed} />
        <div className="border-t border-sidebar-border p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            onClick={() => setCollapsed((value) => !value)}
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
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-16 items-center justify-between gap-3 border-b border-border/70 bg-card/80 px-4 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Sheet>
              <SheetTrigger
                className="inline-flex size-9 items-center justify-center rounded-md hover:bg-accent md:hidden"
                aria-label="Open navigation"
              >
                <Menu />
              </SheetTrigger>
              <SheetContent
                side="left"
                className="flex w-72 flex-col bg-sidebar p-0 text-sidebar-foreground"
              >
                <SheetTitle className="sr-only">
                  Workspace navigation
                </SheetTitle>
                <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
                  <div className="grid size-8 place-items-center rounded-md bg-sidebar-primary font-bold text-sidebar-primary-foreground">
                    O
                  </div>
                  <span className="font-heading text-lg font-semibold">
                    Orbrin
                  </span>
                </div>
                <Navigation role={role} onNavigate={() => undefined} />
              </SheetContent>
            </Sheet>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="hidden sm:inline">{organization}</span>
                <span className="hidden sm:inline">/</span>
                <span className="truncate text-foreground">
                  {current.label}
                </span>
              </div>
              <p className="truncate text-xs text-muted-foreground sm:text-sm">
                {role.toLowerCase()} workspace
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden gap-2 text-muted-foreground sm:flex"
              onClick={openCommand}
            >
              <Search data-icon="inline-start" /> Search
              <span className="text-xs">⌘K</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={openCommand}
              aria-label="Search workspace"
            >
              <CommandIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              asChild
            >
              <Link
                href={
                  role === "MEMBER"
                    ? "/dashboard/member/notifications"
                    : ` /dashboard/${role.toLowerCase()}/activity`.trim()
                }
              >
                <Bell />
              </Link>
            </Button>
            <ThemeToggle />
            <UserMenu user={user} role={role} />
          </div>
        </header>
        <CommandDialog
          open={commandOpen}
          onOpenChange={setCommandOpen}
          title="Search workspace"
          description="Navigate across your workspace"
        >
          <Command className="rounded-xl border-0">
            <CommandInput placeholder="Search workspace..." />
            <CommandList>
              <CommandEmpty>No matching commands.</CommandEmpty>
              <CommandGroup heading="Navigate">
                {dashboardNavigation[role].map(
                  ({ href, label, icon: Icon }) => (
                    <CommandItem
                      key={href}
                      onSelect={() => {
                        setCommandOpen(false);
                        window.location.href = href;
                      }}
                    >
                      <Icon />
                      {label}
                      <CommandShortcut>↵</CommandShortcut>
                    </CommandItem>
                  ),
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>
        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
