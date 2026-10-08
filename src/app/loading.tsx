import { PublicLayout } from "../components/public-site";

export default function HomeLoading() {
  return (
    <PublicLayout isAuthenticated={false}>
      <main className="overflow-hidden animate-pulse">
        {/* Hero Section Skeleton */}
        <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 sm:pt-24 lg:px-8 lg:pb-32 lg:pt-32">
          <div className="mx-auto max-w-3xl text-center flex flex-col items-center">
            {/* Badge Skeleton */}
            <div className="mb-6 h-8 w-64 rounded-full bg-zinc-200 dark:bg-zinc-800" />

            {/* Title Skeleton */}
            <div className="space-y-3 w-full">
              <div className="mx-auto h-12 w-4/5 rounded-lg bg-zinc-200 dark:bg-zinc-800 sm:h-16" />
              <div className="mx-auto h-12 w-2/3 rounded-lg bg-zinc-200 dark:bg-zinc-800 sm:h-16" />
            </div>

            {/* Subtitle Skeleton */}
            <div className="mt-6 space-y-2 w-full max-w-2xl">
              <div className="mx-auto h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="mx-auto h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>

            {/* CTA Buttons Skeleton */}
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row w-full">
              <div className="h-12 w-40 rounded-md bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-12 w-44 rounded-md bg-zinc-200 dark:bg-zinc-800" />
            </div>

            {/* Trust checkmarks metadata skeleton */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
              <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-28 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-36 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>

          {/* Product Preview Image Skeleton */}
          <div className="mx-auto mt-16 max-w-5xl h-[400px] rounded-2xl bg-zinc-200 dark:bg-zinc-800 sm:h-[500px]" />
        </section>

        {/* Trusted Logos Section Skeleton */}
        <section className="border-y border-zinc-200 bg-zinc-50/50 py-10 dark:border-zinc-800 dark:bg-zinc-900/20">
          <div className="mx-auto max-w-7xl px-5 text-center lg:px-8">
            <div className="mx-auto h-4 w-60 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="mt-6 flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-6 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
              ))}
            </div>
          </div>
        </section>

        {/* Feature Grid Section Skeleton */}
        <section className="border-b border-zinc-200/80 bg-white py-20 dark:border-zinc-800 dark:bg-zinc-950 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 lg:px-8 space-y-12">
            <div className="space-y-3 max-w-xl">
              <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-8 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50" />
              ))}
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}