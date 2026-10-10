"use client";

import { useUserProfile } from "@/hooks/queries/use-bff-queries";
import {
  AlertCircle,
  CheckCircle2,
  MailCheck,
  ShieldCheck,
} from "lucide-react";

import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { DeleteAccountDialog } from "@/components/profile/delete-account-dialog";
import { EmailVerificationDialog } from "@/components/profile/email-verification-dialog";
import { ProfileForm } from "@/components/profile/profile-form";
import { ProfileImageUploader } from "@/components/profile/profile-image-uploader";
import { ErrorState } from "@/components/shared/error-state";
import { ProfileSkeleton } from "@/components/shared/skeletons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ProfilePage() {
  const { data: profile, isLoading, isError } = useUserProfile();
  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError || !profile) {
    return (
      <ErrorState
        title="Profile unavailable"
        description="We couldn't load your profile."
      />
    );
  }

  const memberships = profile.memberships ?? [];
  const emailVerified = Boolean(profile.emailVerified);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Profile settings
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal information, email verification, and account
          security.
        </p>
      </header>

      {!emailVerified ? (
        <Card className="border-red-500/40 bg-red-500/5 shadow-sm shadow-red-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5" />
              Email verification
            </CardTitle>

            <CardDescription>
              Verify your email address to secure your account and unlock all
              features.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-600 dark:text-red-400">
                  <AlertCircle className="size-5" />
                </div>

                <div className="space-y-1">
                  <p className="font-semibold text-red-700 dark:text-red-400">
                    Email address not verified
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Verify your email to confirm that you can access this
                    address.
                  </p>

                  <p className="inline-flex items-center gap-1.5 rounded-md bg-background px-2 py-1 text-xs font-medium text-muted-foreground">
                    <MailCheck className="size-3.5" />
                    {profile.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-700 dark:text-red-400">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />

                <p className="text-xs leading-5">
                  Action required: your email is not verified.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-red-500/30 bg-background p-4">
              <div className="w-full sm:w-auto">
                <EmailVerificationDialog
                  email={profile.email}
                  emailVerified={emailVerified}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-6">
        <ProfileImageUploader profile={profile} />
        <ProfileForm profile={profile} />
      </section>

      <ChangePasswordForm />

      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
          <CardDescription>
            Account information and authentication details.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <DetailRow label="Account ID" value={profile.id} breakAll />

          <DetailRow label="Email address" value={profile.email} breakAll />

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <span className="shrink-0 text-sm text-muted-foreground">
              Email verification
            </span>

            {emailVerified ? (
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" />
                Verified
              </span>
            ) : (
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-700 dark:text-red-400">
                <AlertCircle className="size-3.5" />
                Not verified
              </span>
            )}
          </div>

          <DetailRow
            label="Authentication provider"
            value={formatLabel(profile.authProvider)}
          />

          <DetailRow
            label="Account status"
            value={formatLabel(profile.status)}
          />

          <DetailRow label="Created" value={formatDate(profile.createdAt)} />

          <DetailRow
            label="Last updated"
            value={formatDate(profile.updatedAt)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organization memberships</CardTitle>
          <CardDescription>
            Organizations and roles associated with your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {memberships.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No organization memberships found.
            </p>
          ) : (
            <div className="divide-y">
              {memberships.map((membership) => (
                <div
                  key={membership.id}
                  className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {membership.organization.name}
                    </p>

                    <p className="mt-1 break-all text-xs text-muted-foreground">
                      {membership.organization.slug}
                    </p>
                  </div>

                  <span className="w-fit rounded-md bg-muted px-2.5 py-1 text-xs font-medium">
                    {formatLabel(membership.role)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <section className="rounded-xl border border-destructive/30 p-5">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-destructive">
            Danger zone
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Permanently remove your account and associated access.
          </p>
        </div>

        <DeleteAccountDialog />
      </section>
    </div>
  );
}

function DetailRow({
  label,
  value,
  breakAll = false,
}: {
  label: string;
  value: string;
  breakAll?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>

      <span
        className={`text-sm font-medium sm:max-w-[65%] sm:text-right ${
          breakAll ? "break-all" : "break-words"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function formatLabel(value: string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  return value
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string | Date | null | undefined) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}