"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  BarChart3,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  Command as CommandIcon,
  FolderKanban,
  LogOut,
  Menu,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/store/use-auth-store";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: BarChart3 },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/dashboard/team", label: "Team", icon: Users },
];

function initials(name?: string, email?: string) {
  const value = name || email || "User";
  return value.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function Navigation({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Primary">
      {navigation.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
        return (
          <Link key={href} href={href} onClick={onNavigate} aria-current={active ? "page" : undefined} title={collapsed ? label : undefined} className={cn("flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors", active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground", collapsed && "justify-center px-0")}>
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {!collapsed && label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserMenu() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const label = user?.fullName || user?.email || "Account";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-9 items-center gap-2 rounded-md px-2 text-sm font-medium hover:bg-accent" aria-label="Open account menu">
        <Avatar className="size-8"><AvatarFallback>{initials(user?.fullName, user?.email)}</AvatarFallback></Avatar>
        <span className="hidden max-w-32 truncate sm:inline">{label}</span>
        <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal"><p className="truncate text-sm font-medium">{label}</p><p className="truncate text-xs text-muted-foreground">{user?.email || "Signed-in workspace user"}</p></DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => { logout(); router.replace("/login"); }}><LogOut className="size-4" />Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CommandMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const go = (href: string) => { onOpenChange(false); router.push(href); };
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Workspace command menu" description="Navigate across your workspace">
      <Command className="rounded-xl border-0">
        <CommandInput placeholder="Search workspace..." />
        <CommandList>
          <CommandEmpty>No matching commands.</CommandEmpty>
          <CommandGroup heading="Navigate">
            {navigation.map(({ href, label, icon: Icon }) => <CommandItem key={href} onSelect={() => go(href)}><Icon />{label}<CommandShortcut>↵</CommandShortcut></CommandItem>)}
          </CommandGroup>
          <CommandGroup heading="Actions"><CommandItem onSelect={() => go("/dashboard/projects")}><FolderKanban />Create or manage projects</CommandItem><CommandItem onSelect={() => go("/dashboard/tasks")}><CheckSquare />Review tasks</CommandItem></CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuthStore();
  const current = navigation.find((item) => item.href === pathname) || navigation.find((item) => item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`)) || navigation[0];
  const breadcrumbs = current.href === "/dashboard" ? ["Overview"] : ["Workspace", current.label];

  return (
    <div className="flex min-h-svh bg-background">
      <aside className={cn("hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex", collapsed ? "w-20" : "w-64")} aria-label="Workspace navigation">
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5"><div className="grid size-8 shrink-0 place-items-center rounded-md bg-sidebar-primary font-heading font-bold text-sidebar-primary-foreground">O</div>{!collapsed && <span className="font-heading text-lg font-semibold tracking-tight">Orbrin</span>}</div>
        <div className="border-b border-sidebar-border p-3"><button type="button" className={cn("flex w-full items-center gap-2 rounded-md p-2 text-left hover:bg-sidebar-accent", collapsed && "justify-center")} aria-label="Switch organization"><div className="grid size-7 shrink-0 place-items-center rounded bg-sidebar-accent text-xs font-semibold">O</div>{!collapsed && <><span className="min-w-0 flex-1 truncate text-sm font-medium">{user?.organizationId || "Current organization"}</span><ChevronDown className="size-3.5" /></>}</button></div>
        <Navigation collapsed={collapsed} />
        <div className="border-t border-sidebar-border p-3"><Button variant="ghost" size="sm" className="w-full justify-center text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}>{collapsed ? <Menu /> : <><ChevronLeft /> Collapse</>}</Button></div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-16 items-center justify-between gap-3 border-b border-border/70 bg-card/80 px-4 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3"><Sheet><SheetTrigger className="inline-flex size-9 items-center justify-center rounded-md hover:bg-accent md:hidden" aria-label="Open navigation"><Menu /></SheetTrigger><SheetContent side="left" className="flex w-72 flex-col bg-sidebar p-0 text-sidebar-foreground"><SheetTitle className="sr-only">Workspace navigation</SheetTitle><div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5"><div className="grid size-8 place-items-center rounded-md bg-sidebar-primary font-bold text-sidebar-primary-foreground">O</div><span className="font-heading text-lg font-semibold">Orbrin</span></div><Navigation onNavigate={() => undefined} /></SheetContent></Sheet><div className="min-w-0"><div className="flex items-center gap-2 text-xs text-muted-foreground">{breadcrumbs.map((crumb, index) => <span key={crumb} className="flex items-center gap-2"><span className={cn(index === breadcrumbs.length - 1 && "text-foreground")}>{crumb}</span>{index < breadcrumbs.length - 1 && <span aria-hidden="true">/</span>}</span>)}</div><p className="truncate text-xs text-muted-foreground sm:text-sm">{user?.organizationId || "Workspace"}</p></div></div>
          <div className="flex items-center gap-1 sm:gap-2"><ThemeToggle /><Button variant="outline" size="sm" className="hidden gap-2 text-muted-foreground sm:flex" onClick={() => setCommandOpen(true)}><CommandIcon className="size-3.5" />Search<span className="text-xs">⌘K</span></Button><Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setCommandOpen(true)} aria-label="Open command menu"><CommandIcon /></Button><UserMenu /></div>
        </header>
        <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
        <main className="flex-1 overflow-auto"><div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div></main>
      </div>
    </div>
  );
}

