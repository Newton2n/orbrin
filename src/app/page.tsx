import { ArrowRight, CheckCircle2, ShieldAlert, Sparkles, Zap, Globe, Layers } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import {
  FeatureGrid,
  ProductPreview,
  PublicLayout,
  SectionIntro,
  WorkflowSteps,
} from "../components/public-site";
import { Button } from "../components/ui/button";

export default async function Home() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.has("accessToken");

  return (
    <PublicLayout isAuthenticated={isAuthenticated}>
      <main className="overflow-hidden">
        
        {/* --- HERO SECTION --- */}
        <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 sm:pt-24 lg:px-8 lg:pb-32 lg:pt-32">
          {/* Subtle background glow/ambient lighting effect */}
          <div className="absolute left-1/2 top-1/3 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl lg:h-[450px] lg:w-[450px]" />

          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3.5 py-1.5 text-xs font-medium text-zinc-800 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200">
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Orbrin v1.0 is live — Enterprise scale ready</span>
              <Sparkles className="size-3.5 text-primary" />
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl lg:text-7xl">
              Make meaningful work easier to move.
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400 sm:text-lg sm:leading-8">
              ORBRIN brings projects, tasks, sprints, teams, and organization context into one calm, blazingly fast workspace.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="h-12 px-6 rounded-md bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white">
                <Link href={isAuthenticated ? "/dashboard" : "/register"}>
                  {isAuthenticated ? "Go to Dashboard" : "Start building clarity"} <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-6 rounded-md border-zinc-200 dark:border-zinc-800">
                <Link href="/features">Explore the workspace</Link>
              </Button>
            </div>

            {/* Quick mini-perks under CTA */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-emerald-500" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-emerald-500" /> Setup in 2 minutes</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-emerald-500" /> Role-based access control</span>
            </div>
          </div>

          <div className="mx-auto mt-16 max-w-5xl">
            <ProductPreview />
          </div>
        </section>

        {/* --- TRUST BANNER --- */}
        <section className="border-y border-zinc-200 bg-zinc-50/50 py-10 dark:border-zinc-800 dark:bg-zinc-900/20">
          <div className="mx-auto max-w-7xl px-5 text-center lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
              Trusted by high-performing teams worldwide
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-8 opacity-70 grayscale sm:gap-12 md:gap-16">
              {["ACME Corp", "Vortex Labs", "HyperScale", "Synthetix", "Northwind"].map((brand) => (
                <span key={brand} className="font-heading text-lg font-bold tracking-tight text-zinc-700 dark:text-zinc-300">
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* --- SHARED SYSTEM FEATURES --- */}
        <section className="border-b border-zinc-200/80 bg-white py-20 dark:border-zinc-800 dark:bg-zinc-950 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <SectionIntro
              eyebrow="One shared system"
              title="The right context, at every step."
              body="ORBRIN is designed for teams who want the speed of lightweight tools with the confidence of a connected architectural system."
            />
            <div className="mt-12">
              <FeatureGrid />
            </div>
          </div>
        </section>

        {/* --- WORKFLOW STEPS --- */}
        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <SectionIntro
            eyebrow="A better rhythm"
            title="From first idea to finished work."
            body="A simple, repeatable operating rhythm helps teams spend less time coordinating overhead and more time shipping value."
          />
          <div className="mt-12">
            <WorkflowSteps />
          </div>
        </section>

        {/* --- VALUE PROPOSITION BENTO / METRICS SECTION --- */}
        <section className="border-y border-zinc-200 bg-zinc-50/60 py-20 dark:border-zinc-800 dark:bg-zinc-900/40 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                  <Zap className="size-5" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Blazing Performance</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  Engineered with Turbopack and React Server Components for instant page transitions and maximum responsiveness.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                  <Globe className="size-5" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Global Synchronization</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  Keep remote and cross-functional departments synchronized with real-time state tracking and ownership boundaries.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                  <Layers className="size-5" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Modular Hierarchy</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  Structure your projects hierarchically from macro organization goals down to micro checklist items seamlessly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- BOTTOM CTA BANNER --- */}
        <section className="mx-5 my-20 rounded-3xl bg-zinc-900 px-6 py-16 text-white sm:px-12 lg:mx-auto lg:max-w-7xl dark:bg-zinc-100 dark:text-zinc-900">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
              Start with clarity
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Give your team a workspace that keeps up.
            </h2>
            <p className="mt-4 text-base leading-7 text-zinc-300 dark:text-zinc-600">
              Bring the shape of your organization and the granular details of day-to-day execution into one thoughtful place.
            </p>
            <Button
              className="mt-8 h-12 px-6 rounded-md bg-white text-zinc-900 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
              asChild
            >
              <Link href={isAuthenticated ? "/dashboard" : "/register"}>
                {isAuthenticated ? "Open Dashboard Now" : "Create your workspace"} <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </section>

      </main>
    </PublicLayout>
  );
}