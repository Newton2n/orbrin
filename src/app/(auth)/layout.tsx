import type { ReactNode } from "react";
import { ThemeToggle } from "../../components/theme-toggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center bg-white px-4 py-10 dark:bg-zinc-950 sm:px-6 lg:px-8">
      {/* Subtle radial accent – very light, just for depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.94_0.035_210)_0%,transparent_40%)] dark:bg-[radial-gradient(circle_at_top_right,oklch(0.18_0.03_240)_0%,transparent_40%)]"
      />

      {/* Theme toggle */}
      <div className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4">
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="relative z-0 w-full max-w-sm sm:max-w-md">
        {children}
      </div>
    </main>
  );
}