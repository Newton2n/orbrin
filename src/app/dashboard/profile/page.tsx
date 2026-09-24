
import { getMyProfile } from "@/actions/user.action";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { DeleteAccountDialog } from "@/components/profile/delete-account-dialog";
import { ProfileForm } from "@/components/profile/profile-form";
import { ProfileImageUploader } from "@/components/profile/profile-image-uploader";
import { ErrorState } from "@/components/shared/error-state";

export default async function ProfilePage() {
  const result = await getMyProfile();

  if (!result.success || !result.data) {
    return (
      <ErrorState
        title="Profile unavailable"
        description={result.message ?? "We couldn't load your profile."}
      />
    );
  }

  const profile = result.data;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      {/* Page header */}
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Profile settings
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal information and account security.
        </p>
      </header>

      {/* Profile */}
      <section className="space-y-6">
        {/* Profile picture */}
        <ProfileImageUploader profile={profile} />

        {/* Profile information */}
        <ProfileForm profile={profile} />
      </section>

      {/* Security */}
      <ChangePasswordForm />

      {/* Danger zone */}
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

