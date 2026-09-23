import Link from "next/link";
import { Button } from "@/components/ui/button";

export function NotFoundState({
  title = "Not found",
  description = "The requested resource may have been removed or is no longer available.",
  href = "/dashboard",
  label = "Back to dashboard",
}: {
  title?: string;
  description?: string;
  href?: string;
  label?: string;
}) {
  return (
    <main className="grid min-h-[50vh] place-items-center px-6 py-12">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <p className="text-sm font-medium text-muted-foreground">404</p>
        <h1 className="font-heading text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
        <Button asChild>
          <Link href={href}>{label}</Link>
        </Button>
      </div>
    </main>
  );
}
