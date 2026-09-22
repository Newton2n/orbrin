import { 
  FolderKanban, 
  CheckCircle, 
  Users, 
  Zap, 
  Kanban, 
  MessageSquare, 
  ShieldCheck, 
  ArrowRight 
} from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import {
  FeatureGrid,
  PublicLayout,
  SectionIntro,
  WorkflowSteps,
} from "../../components/public-site";
import { Button } from "../../components/ui/button";

export default async function FeaturesPage() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.has("accessToken");

  return (
    <PublicLayout isAuthenticated={isAuthenticated}>
      <main className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        
        {/* --- HEADER INTRO --- */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3.5 py-1 text-xs font-medium text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            The Complete Workspace System
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
            Everything your team needs to keep work moving.
          </h1>
          <p className="mt-4 text-base leading-7 text-zinc-500 dark:text-zinc-400 sm:text-lg">
            ORBRIN connects team organization, dynamic project lifecycles, and agile execution without adding heavy process.
          </p>
        </div>

        {/* --- CORE FEATURE GRID --- */}
        <div className="mt-20">
          <SectionIntro
            eyebrow="Architectural Capabilities"
            title="Engineered for high clarity and execution speed."
            body="Explore the foundational modules built directly into your Orbrin workspace."
          />
          <div className="mt-10">
            <FeatureGrid />
          </div>
        </div>

        {/* --- DETAILED WORKFLOW BREAKDOWN (Teams, Projects, Tasks, Sprints, Kanban) --- */}
        <div className="mt-32 space-y-24">
          
          {/* 1. Teams & Projects Integration */}
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 p-2 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                <Users className="size-5" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                Create teams and orchestrate projects effortlessly.
              </h2>
              <p className="mt-4 text-sm leading-6 text-zinc-500 dark:text-zinc-400 sm:text-base">
                Group members into specialized squads, assign multi-layered projects directly to teams, and maintain crystal-clear boundaries of ownership across your entire organization.
              </p>
              <ul className="mt-6 flex flex-col gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                <li className="flex items-center gap-3">
                  <CheckCircle className="size-4 text-emerald-500 shrink-0" />
                  <span>Granular team permission and role assignments</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="size-4 text-emerald-500 shrink-0" />
                  <span>One-click assignment of complex projects to teams</span>
                </li>
              </ul>
            </div>
            
            {/* Visual Mockup Card */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-xs">
                    EN
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Engineering Squad</p>
                    <p className="text-xs text-zinc-400">4 active projects assigned</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Active</span>
              </div>
              <div className="mt-4 space-y-3">
                <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Core Architecture Migration</p>
                  <p className="mt-1 text-[11px] text-zinc-400">Assigned to Lead Platform Team • Due Q3</p>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Design System Tokens</p>
                  <p className="mt-1 text-[11px] text-zinc-400">Assigned to UI/UX Product Guild • In progress</p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Tasks, Assignments & Comments */}
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Visual Mockup Card */}
            <div className="order-2 lg:order-1 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-zinc-200/80 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">TASK-849</span>
                  <span className="text-xs text-emerald-500 font-medium">In Review</span>
                </div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Implement secure OAuth token rotation</h4>
                <div className="flex items-center gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
                  <MessageSquare className="size-3.5 text-zinc-400" />
                  <span>3 comments on task thread</span>
                </div>
                <div className="rounded-lg bg-white p-3 border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 text-xs text-zinc-600 dark:text-zinc-400">
                  &quot;Updated the refresh token logic. Ready for final security review.&quot; — Newton Bepari
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 p-2 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                <CheckCircle className="size-5" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                Precision task assignments and contextual collaboration.
              </h2>
              <p className="mt-4 text-sm leading-6 text-zinc-500 dark:text-zinc-400 sm:text-base">
                Break projects into manageable tasks, delegate ownership instantly to team members, and keep all relevant engineering or design comments right inside the task stream.
              </p>
              <ul className="mt-6 flex flex-col gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                <li className="flex items-center gap-3">
                  <CheckCircle className="size-4 text-emerald-500 shrink-0" />
                  <span>Direct member assignment with priority levels</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="size-4 text-emerald-500 shrink-0" />
                  <span>Rich inline discussions and contextual thread comments</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 3. Sprints & Kanban Board Execution */}
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 p-2 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                <Kanban className="size-5" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                Sprints and Kanban boards built for continuous momentum.
              </h2>
              <p className="mt-4 text-sm leading-6 text-zinc-500 dark:text-zinc-400 sm:text-base">
                Create structured sprints for your projects, track progress visually across custom Kanban board statuses (Backlog, In Progress, In Review, Completed), and never lose sight of a delivery milestone.
              </p>
              <ul className="mt-6 flex flex-col gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                <li className="flex items-center gap-3">
                  <CheckCircle className="size-4 text-emerald-500 shrink-0" />
                  <span>Time-boxed sprint creation tied directly to project goals</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="size-4 text-emerald-500 shrink-0" />
                  <span>Interactive Kanban board status tracking</span>
                </li>
              </ul>
            </div>

            {/* Kanban Preview Box */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">To Do (Sprint 12)</p>
                <div className="mt-3 space-y-2">
                  <div className="rounded border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-950 text-xs">
                    <p className="font-medium text-zinc-800 dark:text-zinc-200">API rate limiting</p>
                    <span className="text-[10px] text-zinc-400">High Priority</span>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">Completed</p>
                <div className="mt-3 space-y-2">
                  <div className="rounded border border-emerald-500/20 bg-emerald-500/5 p-2 text-xs">
                    <p className="font-medium text-zinc-800 dark:text-zinc-200">Database indexing</p>
                    <span className="text-[10px] text-emerald-500">Done</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* --- WORKFLOW RHYTHM SECTION --- */}
        <div className="mt-32">
          <SectionIntro
            eyebrow="Operating Rhythm"
            title="A clear path through the work."
            body="Keep your operating rhythm visible from planning through delivery."
          />
          <div className="mt-10">
            <WorkflowSteps />
          </div>
        </div>

        {/* --- BOTTOM CALL TO ACTION --- */}
        <div className="mt-28 rounded-3xl border border-zinc-200 bg-zinc-900 px-8 py-16 text-white text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to bring absolute clarity to your team?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-zinc-400 sm:text-base">
            Set up your organization, invite team members, and launch your first sprint in under two minutes.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild className="h-11 px-6 bg-white text-zinc-900 hover:bg-zinc-100 dark:bg-zinc-100 dark:text-zinc-900">
              <Link href={isAuthenticated ? "/dashboard" : "/register-owner"}>
                {isAuthenticated ? "Go to Dashboard" : "Get started now"} <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>

      </main>
    </PublicLayout>
  );
}