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
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  return (
    <header className="flex min-h-16 items-center justify-between gap-3 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur sm:px-6 dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="flex min-w-0 items-center gap-3">
        <Sheet>
          <SheetTrigger
            className="inline-flex size-9 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 md:hidden"
            aria-label="Open navigation"
          >
            <Menu />
          </SheetTrigger>
          <SheetContent
            side="left"
            className="flex w-72 flex-col bg-white p-0 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50"
          >
            <SheetTitle className="sr-only">Workspace navigation</SheetTitle>
            <div className="flex h-16 items-center gap-3 border-b border-zinc-200 px-5 dark:border-zinc-800">
              <div className="grid size-8 place-items-center rounded-md bg-zinc-900 font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                O
              </div>
              <span className="font-heading text-lg font-semibold">Orbrin</span>
            </div>
            <NavLinks role={role} />
          </SheetContent>
        </Sheet>
        <Button
          variant="ghost"
          size="sm"
          className="hidden items-center gap-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 sm:inline-flex"
          asChild
        >
          <Link href="/">
            <Home className="size-4" />
            Home
          </Link>
        </Button>
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="hidden sm:inline">{organization}</span>
            <span className="hidden sm:inline">/</span>
            <span className="truncate text-zinc-900 dark:text-zinc-50">
              {current.label}
            </span>
          </div>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
            {role.toLowerCase()} workspace
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          variant="outline"
          size="sm"
          className="hidden gap-2 border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 sm:flex"
          onClick={() => setCommandOpen(true)}
        >
          <Search data-icon="inline-start" />
          Search<span className="text-xs">⌘K</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-600 dark:text-zinc-400 sm:hidden"
          onClick={() => setCommandOpen(true)}
          aria-label="Search workspace"
        >
          <CommandIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-600 dark:text-zinc-400"
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
            <Bell />
          </Link>
        </Button>
        <ThemeToggle />
        <UserMenu user={user} role={role} />
      </div>
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
                  {label}
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
