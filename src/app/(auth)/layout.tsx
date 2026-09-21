import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-[radial-gradient(circle_at_top_right,oklch(0.91_0.045_190),transparent_38%),var(--background)] px-4 py-10">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
