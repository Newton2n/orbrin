"use client";
import { RouteErrorState } from "@/components/shared/route-error-state";
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <RouteErrorState reset={reset} homeHref="/" />; }
