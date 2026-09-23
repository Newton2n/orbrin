"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RouteErrorState({ reset, title = "Something went wrong", description = "We couldn’t load this page. Please try again or return to a safe page." , homeHref = "/dashboard" }: { reset: () => void; title?: string; description?: string; homeHref?: string }) {
  return <main className="flex min-h-[50vh] items-center justify-center px-4 py-12"><div className="flex max-w-md flex-col items-center gap-5 text-center"><div className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive"><AlertTriangle aria-hidden="true" /></div><div className="flex flex-col gap-2"><h1 className="font-heading text-2xl font-semibold tracking-tight">{title}</h1><p className="text-sm leading-6 text-muted-foreground">{description}</p></div><div className="flex flex-wrap justify-center gap-3"><Button onClick={reset}>Try again</Button><Button asChild variant="outline"><Link href={homeHref}>Go to dashboard</Link></Button></div></div></main>;
}
