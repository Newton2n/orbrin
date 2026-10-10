"use client";

import { useUserProfile } from "@/hooks/queries/use-bff-queries";

import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { DeleteAccountDialog } from "@/components/profile/delete-account-dialog";
import { ProfileForm } from "@/components/profile/profile-form";
import { ProfileImageUploader } from "@/components/profile/profile-image-uploader";
import { ErrorState } from "@/components/shared/error-state";
import { ProfileSkeleton } from "@/components/shared/skeletons";

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

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Profile settings
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal information and account security.
        </p>
      </header>

      <section className="space-y-6">
        <ProfileImageUploader profile={profile} />

        <ProfileForm profile={profile} />
      </section>

      <ChangePasswordForm />

      <section className="border-t pt-6">
        <div className="mb-4">
          <h2 className="text-sm font-semibold">Danger zone</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Permanently remove your account and associated access.
          </p>
        </div>

        <DeleteAccountDialog />
      </section>
    </div>
  );
}
