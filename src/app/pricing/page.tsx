import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { hasValidAccessToken } from "../../actions/auth.action";
import { PublicLayout, SectionIntro } from "../../components/public-site";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

export default async function PricingPage() {
  const isAuthenticated = await hasValidAccessToken();

  return (
    <PublicLayout isAuthenticated={isAuthenticated}>
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
              Orbrin Pricing
            </p>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            One plan. Everything you need.
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
            No complicated tiers or hidden limits. Full access to our complete
            workspace toolkit.
          </p>
        </div>

        {/* Added mt-6 to provide breathing room for the absolute badge */}
        <div className="mt-16 mx-auto max-w-sm">
          <Card className="relative overflow-visible mt-4 border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            {/* Centered absolute badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-md dark:bg-zinc-100 dark:text-zinc-900">
              <Sparkles className="size-3" /> Pro Workspace
            </div>

            <CardHeader className="px-5 pt-7 sm:px-6 sm:pt-8 text-center">
              <CardTitle className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Pro Plan
              </CardTitle>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                The complete operating system for modern high-performing teams.
              </p>
            </CardHeader>

            <CardContent className="px-5 pb-6 sm:px-6 sm:pb-8">
              <div className="text-center pt-2">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    $20
                  </span>
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    / month
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                  Billed monthly. Cancel anytime.
                </p>
              </div>

              <ul className="mt-6 flex flex-col gap-3">
                {[
                  "Unlimited team members",
                  "Advanced sprint analytics & timelines",
                  "Real-time organization synchronization",
                  "Role-based permission controls",
                  "Priority 24/7 feature support",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-300"
                  >
                    <div className="grid size-4 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                      <Check className="size-3" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="mt-8 h-11 w-full rounded-md bg-zinc-900 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                asChild
              >
                <Link href={isAuthenticated ? "/dashboard" : "/login"}>
                  {isAuthenticated ? "Go to Dashboard" : "Get started with Pro"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </PublicLayout>
  );
}
