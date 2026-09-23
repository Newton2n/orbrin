"use client";

import { Bell, Command as CommandIcon, Home, Menu, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import type { AuthUser, Role } from "@/features/auth/types/auth.types";
import { NavLinks } from "./nav-links";
import { dashboardNavigation } from "./shared/dashboard-content";
import { UserMenu } from "./user-menu";

export function DashboardHeader({
  user,
  role,
  organization,
}: {
  user: AuthUser;
  role: Role;
  organization: string;
}) {
  const pathname = usePathname();
  const [commandOpen, setCommandOpen] = useState(false);

  const current =
    dashboardNavigation[role].find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    ) ?? dashboardNavigation[role][0];

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
    };

    window.addEventListener("keydown", handleShortcut);

    return () => {
      window.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 flex min-h-16 w-full items-center border-b border-border bg-background/90 backdrop-blur">
      <div className="flex w-full min-w-0 items-center justify-between gap-2 px-3 sm:gap-3 sm:px-6">
        {/* Left section */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground md:hidden"
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </SheetTrigger>

            <SheetContent
              side="left"
              className="flex w-[280px] flex-col bg-background p-0 text-foreground"
            >
              <SheetTitle className="sr-only">Workspace navigation</SheetTitle>

              <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-5">
                <div className="grid size-8 shrink-0 place-items-center rounded-md bg-zinc-900 font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                  O
                </div>

                <span className="font-heading text-lg font-semibold">
                  Orbrin
                </span>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                <NavLinks role={role} />
              </div>
            </SheetContent>
          </Sheet>

          {/* Home */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden shrink-0 items-center gap-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground md:inline-flex"
            asChild
          >
            <Link href="/">
              <Home className="size-4" />
              <span>Home</span>
            </Link>
          </Button>

          {/* Breadcrumb */}
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground sm:gap-2">
              <span className="hidden max-w-[180px] truncate sm:inline">
                {organization}
              </span>

              <span className="hidden sm:inline">/</span>

              <span className="min-w-0 truncate font-medium text-foreground">
                {current.label}
              </span>
            </div>

            <p className="hidden truncate text-xs text-muted-foreground sm:block sm:text-sm">
              {role.toLowerCase()} workspace
            </p>
          </div>
        </div>

        {/* Right section */}
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
          {/* Desktop search */}
          <Button
            variant="outline"
            size="sm"
            className="hidden h-9 gap-2 px-3 text-muted-foreground md:flex"
            onClick={() => setCommandOpen(true)}
          >
            <Search className="size-4" />
            <span>Search</span>
            <kbd className="ml-1 hidden text-[10px] font-normal lg:inline">
              ⌘K
            </kbd>
          </Button>

          {/* Mobile / tablet search */}
          <Button
            variant="ghost"
            size="icon"
            className="size-9 text-muted-foreground md:hidden"
            onClick={() => setCommandOpen(true)}
            aria-label="Search workspace"
          >
            <CommandIcon className="size-5" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="size-9 shrink-0 text-muted-foreground"
            aria-label="Notifications"
            asChild
          >
            <Link
              href={
                role === "MEMBER"
                  ? "/dashboard/member/notifications"
                  : `/dashboard/${role.toLowerCase()}/activity`
              }
            >
              <Bell className="size-5" />
            </Link>
          </Button>

          {/* Theme */}
          <div className="shrink-0">
            <ThemeToggle />
          </div>

          {/* User menu */}
          <div className="shrink-0">
            <UserMenu user={user} role={role} />
          </div>
        </div>
      </div>

      {/* Command dialog */}
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
              {dashboardNavigation[role].map(({ href, label, icon: Icon }) => (
                <CommandItem
                  key={href}
                  onSelect={() => {
                    setCommandOpen(false);
                    window.location.href = href;
                  }}
                >
                  <Icon />
                  <span>{label}</span>
                  <CommandShortcut>↵</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </header>
  );
}
