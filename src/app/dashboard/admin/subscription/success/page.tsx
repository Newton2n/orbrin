import { getSubscriptionHistory } from "@/actions/subscription.action";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SubscriptionSuccessPage() {
  const result = await getSubscriptionHistory();

  // Make sure the payment has actually activated the subscription.
  if (!result.success || result.data?.status !== "ACTIVE") {
    redirect("/dashboard/admin/subscription");
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="size-7 text-primary" />
        </div>

        <h1 className="mt-5 text-2xl font-semibold tracking-tight">
          Subscription activated
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Your subscription is now active. You can manage your
          subscription and billing history from the subscription page.
        </p>

        <div className="mt-6 flex justify-center">
          <Button asChild>
            <Link href="/dashboard/admin/subscription">
              View subscription
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}