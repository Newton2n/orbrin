import type { ReactNode } from "react";
import Link from "next/link";
import { KeyRound, ShieldCheck, UserPlus } from "lucide-react";

import { cn } from "cn";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "../../components/theme-toggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen bg-background">
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between py-2">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
              O
            </span>
            <span className="text-sm font-medium text-foreground">Orbrin</span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Card */}
        <div className="my-auto grid w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:grid-cols-2">
          {/* Left — form */}
          <section className="flex items-center justify-center p-6 sm:p-10 lg:p-14">
            <div className="w-full max-w-sm">{children}</div>
          </section>

          {/* Right — brand & product context */}
          <section className="hidden border-l border-border bg-muted/40 lg:flex">
            <div className="flex w-full flex-col justify-between p-10 xl:p-12">
              {/* Headline */}
              <div>
                <h2 className="text-[26px] font-semibold leading-[1.25] tracking-tight text-foreground xl:text-[30px]">
                  One sign-in. Every project your team is running.
                </h2>
                <p className="mt-3 max-w-[34ch] text-sm leading-6 text-muted-foreground">
                  Your role decides what you see the moment you land —
                  nothing to configure, nothing to wait on.
                </p>
              </div>

              {/* Live workspace preview */}
              <div className="my-8 rounded-lg border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Northwind Studio</p>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    4 online
                  </span>
                </div>

                <Separator className="my-3" />

                <div className="space-y-3">
                  <PreviewRow initials="AK" name="Amara Kim" role="Admin" />
                  <PreviewRow initials="MR" name="Milo Reyes" role="Manager" />
                  <PreviewRow initials="SB" name="Sara Beck" role="Member" />
                </div>
              </div>

              {/* Access flow — a genuine sequence */}
              <div className="relative space-y-5 pl-9">
                <div className="absolute bottom-2 left-[15px] top-2 w-px bg-border" />
                <FlowStep icon={KeyRound} active title="Sign in" description="Email and password, or continue with Google." />
                <FlowStep icon={UserPlus} title="Join your team" description="New members arrive through an invitation link." />
                <FlowStep icon={ShieldCheck} title="Get the right access" description="Admin, Manager, and Member each see something different." />
              </div>

              {/* Links */}
              <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-5 text-sm text-muted-foreground">
                <FooterLink href="/login">Login</FooterLink>
                <FooterLink href="/forgot-password">Forgot password</FooterLink>
                <FooterLink href="/register-member">Have an invitation?</FooterLink>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function PreviewRow({ initials, name, role }: { initials: string; name: string; role: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <Avatar className="h-6 w-6">
          <AvatarFallback className="bg-muted text-[10px] font-medium text-muted-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm text-foreground">{name}</span>
      </div>
      <Badge variant="secondary" className="font-normal text-muted-foreground">
        {role}
      </Badge>
    </div>
  );
}

function FlowStep({
  icon: Icon,
  title,
  description,
  active = false,
}: {
  icon: typeof KeyRound;
  title: string;
  description: string;
  active?: boolean;
}) {
  return (
    <div className="relative flex gap-3">
      <span
        className={cn(
          "absolute -left-9 top-0 flex h-[30px] w-[30px] items-center justify-center rounded-md border",
          active
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-card text-muted-foreground"
        )}
      >
        <Icon className="h-[15px] w-[15px]" strokeWidth={1.75} />
      </span>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="underline decoration-border decoration-1 underline-offset-4 transition-colors hover:text-foreground hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {children}
    </Link>
  );
}