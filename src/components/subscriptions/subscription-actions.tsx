
"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { createCheckout } from "@/actions/subscription.action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SubscriptionActionsProps = {
  className?: string;
};

export function SubscriptionActions({
  className,
}: SubscriptionActionsProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleCheckout() {
    if (loading) return;

    setLoading(true);

    try {
      const result = await createCheckout();

      if (!result.success || !result.data?.url) {
        toast.error(result.message ?? "Unable to start checkout.");
        return;
      }

      window.location.href = result.data.url;
    } catch (error) {
      console.error(error);

      toast.error("Unable to start checkout.", {
        description: "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleConfirm() {
    setOpen(false);
    void handleCheckout();
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        disabled={loading}
        className={className}
      >
        Start subscription
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl">
              Confirm subscription
            </DialogTitle>

            <DialogDescription className="text-sm leading-6">
              You are about to start your Orbrin subscription. You will be
              redirected to Stripe to securely complete the payment.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border bg-muted/40 p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">
                Subscription
              </span>

              <span className="text-sm font-medium">
                Orbrin Base One Month
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Opening checkout...
                </>
              ) : (
                "Continue to checkout"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
