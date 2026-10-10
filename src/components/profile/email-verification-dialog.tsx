"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Loader2,
  MailCheck,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import {
  sendVerificationEmail,
  verifyEmail,
} from "@/actions/auth.action";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EmailVerificationDialogProps {
  email: string;
  emailVerified: boolean;
}

export function EmailVerificationDialog({
  email,
  emailVerified,
}: EmailVerificationDialogProps) {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      setCodeSent(false);
      setOtp("");
      setSending(false);
      setVerifying(false);
    }
  }

  async function handleSendCode() {
    if (sending || verifying) {
      return;
    }

    setSending(true);

    try {
      const result = await sendVerificationEmail(email);

      if (!result.success) {
        toast.error(
          result.message ?? "Unable to send the verification code.",
        );
        return;
      }

      setCodeSent(true);
      setOtp("");
      toast.success(
        result.message ?? "Verification code sent to your email.",
      );
    } catch {
      toast.error("Something went wrong while sending the code.");
    } finally {
      setSending(false);
    }
  }

  async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (otp.length !== 6 || verifying || sending) {
      return;
    }

    setVerifying(true);

    try {
      const result = await verifyEmail({ email, otp });

      if (!result.success) {
        toast.error(
          result.message ?? "Invalid or expired verification code.",
        );
        return;
      }

      toast.success(result.message ?? "Email verified successfully.");

      await queryClient.invalidateQueries({
        queryKey: ["user-profile"],
      });

      handleOpenChange(false);
    } catch {
      toast.error("Something went wrong while verifying your email.");
    } finally {
      setVerifying(false);
    }
  }

  if (emailVerified) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="size-3.5" />
        Verified
      </span>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            type="button"
            size="lg"
            className="w-full cursor-pointer bg-red-600 text-white shadow-md shadow-red-600/20 transition-all hover:bg-red-700 hover:shadow-red-600/30 focus-visible:ring-red-600/40 sm:w-auto"
          >
            <ShieldCheck className="size-4" />
            Verify email now
          </Button>
        }
      />

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-red-500/10">
            {codeSent ? (
              <MailCheck className="size-5 text-red-600 dark:text-red-400" />
            ) : (
              <ShieldCheck className="size-5 text-red-600 dark:text-red-400" />
            )}
          </div>

          <DialogTitle>
            {codeSent ? "Enter verification code" : "Verify your email"}
          </DialogTitle>

          <DialogDescription>
            {codeSent
              ? "Enter the six-digit code sent to the email address below."
              : "Verify your email address to help secure your Orbrin account."}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
          <p className="text-xs text-muted-foreground">Email address</p>

          <p className="mt-1 break-all text-sm font-medium">{email}</p>
        </div>

        {!codeSent ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We’ll send a verification code to this address. You can enter
              the code here after it arrives.
            </p>

            <DialogFooter>
              <Button
                type="button"
                className="w-full cursor-pointer bg-red-600 text-white hover:bg-red-700"
                onClick={() => void handleSendCode()}
                disabled={sending}
              >
                {sending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  <>
                    <MailCheck className="size-4" />
                    Send verification code
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-verification-otp">
                Six-digit verification code
              </Label>

              <Input
                id="email-verification-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                maxLength={6}
                required
                disabled={verifying || sending}
                aria-describedby="email-verification-otp-help"
                className="text-center text-lg tracking-[0.4em]"
              />

              <p
                id="email-verification-otp-help"
                className="text-xs text-muted-foreground"
              >
                Check your inbox and spam folder. Enter all six digits.
              </p>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button
                type="submit"
                className="w-full cursor-pointer bg-red-600 text-white hover:bg-red-700"
                disabled={otp.length !== 6 || verifying || sending}
              >
                {verifying ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify email address"
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full cursor-pointer"
                onClick={() => void handleSendCode()}
                disabled={sending || verifying}
              >
                {sending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Resend verification code"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}