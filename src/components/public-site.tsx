"use client";

import {
  ArrowRight,
  Check,
  Circle,
  Command,
  FolderKanban,
  Menu,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle, ThemeOptions } from "./theme-toggle";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";
import { LogoutButton } from "./logout-button";

const links = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/dashboard", label: "Dashboard" },
];

interface PublicHeaderProps {
  isAuthenticated?: boolean;
}

interface PublicNavProps {
  isMobile?: boolean;
  closeSheet?: () => void;
}

function PublicNav({ isMobile = false, closeSheet }: PublicNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={
        isMobile
          ? "mt-6 flex flex-col gap-1"
          : "hidden items-center gap-7 md:flex"
      }
    >
      {links.map((link) => {
        const isActive = pathname === link.href;

        if (isMobile) {
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeSheet}
              className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
              }`}
            >
              {link.label}
            </Link>
          );
        }

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`relative text-sm transition-colors py-1 ${
              isActive
                ? "font-semibold text-zinc-900 dark:text-zinc-50 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-zinc-900 dark:after:bg-zinc-50"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function PublicHeader({ isAuthenticated = false }: PublicHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-zinc-900 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
            O
          </span>{" "}
          ORBRIN
        </Link>

        {/* Desktop Navigation Links */}
        <PublicNav />

        {/* Desktop Navigation Actions */}
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {isAuthenticated ? (
            <LogoutButton variant="ghost" />
          ) : (
            <>
              <Button
                variant="ghost"
                asChild
                className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
              >
                <Link href="/login">Sign in</Link>
              </Button>
              <Button
                asChild
                className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                <Link href="/register">
                  Get started <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Navigation Sheet */}
        <Sheet>
          <SheetTrigger
            render={
              <button
                type="button"
                className="inline-flex size-9 items-center justify-center rounded-md text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:focus-visible:ring-zinc-600 md:hidden"
                aria-label="Open navigation"
              />
            }
          >
            <Menu aria-hidden="true" />
          </SheetTrigger>
          <SheetContent className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
                <SheetTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  ORBRIN navigation
                </SheetTitle>
              </div>

              {/* Mobile Navigation Links with Active Status */}
              <PublicNav isMobile />

              <Separator className="my-3 dark:bg-zinc-800" />

              <div className="flex flex-col gap-1">
                {isAuthenticated ? (
                  <LogoutButton
                    variant="ghost"
                    className="w-full justify-start px-3 py-2.5 text-sm h-auto text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                  />
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="rounded-md px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                    >
                      Sign in
                    </Link>
                    <Button
                      asChild
                      className="mt-2 w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                    >
                      <Link href="/register">Get started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Theme Options Footer inside Sheet */}
            <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <p className="mb-2 text-xs font-medium text-zinc-400 dark:text-zinc-500">
                Theme preference
              </p>
              <div className="flex justify-center">
                <ThemeOptions />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-zinc-200/80 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-5 lg:px-8">
        <div className="lg:col-span-2">
          <Link
            href="/"
            className="font-heading text-lg font-semibold text-zinc-900 dark:text-zinc-50"
          >
            ORBRIN
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            A focused workspace for teams that want clarity without complexity.
          </p>
        </div>
        {[
          {
            title: "Product",
            items: [
              ["Features", "/features"],
              ["Pricing", "/pricing"],
            ],
          },
          {
            title: "Company",
            items: [
              ["About", "/about"],
              ["Contact", "/contact"],
            ],
          },
          {
            title: "Account",
            items: [
              ["Sign in", "/login"],
              ["Get started", "/register"],
            ],
          },
        ].map((group) => (
          <div key={group.title}>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">
              {group.title}
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {group.items.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-zinc-200/80 px-5 py-5 text-xs text-zinc-400 sm:flex-row sm:items-center sm:justify-between lg:px-8 dark:border-zinc-800">
        <span>© {new Date().getFullYear()} ORBRIN</span>
        <span>Built for thoughtful delivery.</span>
      </div>
    </footer>
  );
}

export function ProductPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white text-left shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <span className="size-2 rounded-full bg-red-400" />
        <span className="size-2 rounded-full bg-amber-400" />
        <span className="size-2 rounded-full bg-emerald-400" />
        <span className="ml-3 text-xs text-zinc-400">orbrin / workspace</span>
      </div>
      <div className="grid min-h-72 sm:grid-cols-[150px_1fr]">
        <div className="hidden border-r border-zinc-200 bg-zinc-50/50 p-4 text-zinc-600 sm:block dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-400">
          <div className="mb-8 flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            <span className="grid size-5 place-items-center rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
              O
            </span>{" "}
            ORBRIN
          </div>
          <div className="flex flex-col gap-3 text-xs text-zinc-500">
            <span className="rounded bg-zinc-200/70 px-2 py-1 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
              Overview
            </span>
            <span>Projects</span>
            <span>Tasks</span>
            <span>Teams</span>
          </div>
        </div>
        <div className="p-5 sm:p-7">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
            Workspace overview
          </p>
          <h3 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Good morning, team.
          </h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {["Active projects", "Open tasks", "Team members"].map((label) => (
              <div
                key={label}
                className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {label}
                </p>
                <p className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                  —
                </p>
                <p className="mt-1 text-[10px] text-zinc-400">
                  Connect your data
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-900 dark:text-zinc-200">
                Delivery health
              </span>
              <span className="text-[10px] text-zinc-400">
                Ready for live data
              </span>
            </div>
            <div className="mt-4 flex items-end gap-1">
              {[35, 52, 44, 68, 61, 82, 74, 90].map((height) => (
                <span
                  key={height}
                  className="flex-1 rounded-t bg-zinc-900 dark:bg-zinc-100"
                  style={{ height: `${height / 2}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const featureCards = [
  {
    icon: FolderKanban,
    title: "Projects",
    body: "Keep initiatives, documents, teams, and delivery context together.",
  },
  {
    icon: Check,
    title: "Tasks",
    body: "Turn plans into clear next actions with ownership and priority.",
  },
  {
    icon: Zap,
    title: "Sprints",
    body: "Create a steady operating rhythm around focused delivery windows.",
  },
  {
    icon: Users,
    title: "Teams",
    body: "Make responsibilities and collaboration visible across the organization.",
  },
  {
    icon: ShieldCheck,
    title: "Organization control",
    body: "Manage members, roles, and workspace settings with confidence.",
  },
  {
    icon: Command,
    title: "One workspace",
    body: "Give every team a shared source of truth without extra ceremony.",
  },
];

export function FeatureGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {featureCards.map(({ icon: Icon, title, body }) => (
        <Card
          key={title}
          className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <CardContent className="p-6">
            <Icon className="size-5 text-zinc-900 dark:text-zinc-100" />
            <h3 className="mt-6 text-base font-semibold text-zinc-900 dark:text-zinc-50">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              {body}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-zinc-500 dark:text-zinc-400">
        {body}
      </p>
    </div>
  );
}

export function PublicLayout({
  children,
  isAuthenticated = false,
}: {
  children: React.ReactNode;
  isAuthenticated?: boolean;
}) {
  return (
    <div className="min-h-svh bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <PublicHeader isAuthenticated={isAuthenticated} />
      {children}
      <PublicFooter />
    </div>
  );
}

export function WorkflowSteps() {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {[
        {
          n: "01",
          title: "Plan",
          body: "Shape the work and define the outcome.",
        },
        {
          n: "02",
          title: "Organize",
          body: "Connect projects, teams, and ownership.",
        },
        {
          n: "03",
          title: "Execute",
          body: "Move tasks forward with shared context.",
        },
        {
          n: "04",
          title: "Deliver",
          body: "Review progress and keep momentum.",
        },
      ].map((step) => (
        <div
          key={step.n}
          className="border-l border-zinc-200 px-5 py-2 dark:border-zinc-800"
        >
          <span className="font-mono text-xs font-semibold text-zinc-400">
            {step.n}
          </span>
          <h3 className="mt-4 font-semibold text-zinc-900 dark:text-zinc-50">
            {step.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            {step.body}
          </p>
        </div>
      ))}
    </div>
  );
}

export function HeroIcon() {
  return <Sparkles className="size-4" aria-hidden="true" />;
}
export function Dot() {
  return (
    <Circle
      className="size-3 fill-zinc-900 text-zinc-900 dark:fill-zinc-100 dark:text-zinc-100"
      aria-hidden="true"
    />
  );
}
