"use client";

import { Copy, Send, Share2, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function InviteMembersDialog({
  organizationId,
}: {
  organizationId?: string | null;
}) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [webShareAvailable, setWebShareAvailable] = useState(false);
  const inviteUrl = organizationId
    ? `https://orbrin.vercel.app/register-member?organizationId=${organizationId}`
    : null;
  const invitationMessage = inviteUrl
    ? `You're invited to join our organization on Orbrin.\n\nRegister here:\n${inviteUrl}`
    : null;
  const shareMessage = invitationMessage?.replace(`\n${inviteUrl}`, "");

  useEffect(() => {
    setWebShareAvailable("share" in navigator);
  }, []);

  async function copyText(value: string, message: string) {
    try {
      await navigator.clipboard.writeText(value);
      setFeedback(message);
      window.setTimeout(() => setFeedback(null), 2000);
    } catch {
      setFeedback("Copy failed. Try again.");
    }
  }

  async function shareInvitation() {
    if (!inviteUrl || !shareMessage || !webShareAvailable) return;

    try {
      await navigator.share({
        title: "Join our organization on Orbrin",
        text: shareMessage,
        url: inviteUrl,
      });
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        setFeedback("Unable to share invitation.");
      }
    }
  }

  return (
    <Dialog>
      <DialogTrigger
        render={<Button variant="outline" className="w-full justify-start" />}
      >
        <UserPlus data-icon="inline-start" /> Invite member
      </DialogTrigger>

      <DialogContent className="w-[calc(100%-2rem)] max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Invite members</DialogTitle>
            <Badge variant="secondary">Admin only</Badge>
          </div>
          <DialogDescription>
            Share this invitation with someone you want to add to your
            organization.
          </DialogDescription>
        </DialogHeader>

        {inviteUrl && invitationMessage ? (
          <div className="flex flex-col gap-4">
            <div className="flex min-w-0 flex-col gap-2 text-sm font-medium">
              <span>Invitation link</span>
              <div className="flex min-w-0 gap-2">
                <Input
                  id="invitation-link"
                  readOnly
                  value={inviteUrl}
                  aria-label="Invitation link"
                  className="min-w-0 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void copyText(inviteUrl, "Copied!")}
                >
                  <Copy data-icon="inline-start" />
                  <span className="hidden sm:inline">Copy link</span>
                  <span className="sm:hidden">Copy</span>
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-sm font-medium">
              Invitation message
              <div className="rounded-md border border-input bg-muted/30 p-3">
                <p className="whitespace-pre-line break-words text-sm font-normal text-muted-foreground">
                  {invitationMessage}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto sm:self-start"
                onClick={() =>
                  void copyText(invitationMessage, "Invitation copied!")
                }
              >
                <Send data-icon="inline-start" /> Copy invitation
              </Button>
            </div>
          </div>
        ) : (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            An organization ID is unavailable, so an invitation cannot be
            generated.
          </p>
        )}

        <DialogFooter>
          {feedback && (
            <output className="mr-auto text-xs text-muted-foreground">
              {feedback}
            </output>
          )}
          {inviteUrl && invitationMessage && webShareAvailable && (
            <Button type="button" onClick={() => void shareInvitation()}>
              <Share2 data-icon="inline-start" /> Share invitation
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
