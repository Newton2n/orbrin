import { getSubscriptionHistory } from "@/actions/subscription.action";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SubscriptionCancelPage() {
  const result = await getSubscriptionHistory();


  if (
    result.success &&
    result.data?.status === "ACTIVE"
  ) {
    redirect("/dashboard/admin/subscription");
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted">
          <XCircle className="size-7 text-muted-foreground" />
        </div>

        <h1 className="mt-5 text-2xl font-semibold tracking-tight">
          Checkout cancelled
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Your subscription checkout was cancelled. No new
          subscription was created.
        </p>

        <div className="mt-6 flex justify-center">
          <Button asChild>
            <Link href="/dashboard/admin/subscription">
              Back to subscription
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}