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
        description={result.message ?? "We couldn’t load your profile."}
      />
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Account
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.04em]">
          Profile settings
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your identity, security, and account access.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ProfileImageUploader profile={result.data} />
        <ProfileForm profile={result.data} />
        <ChangePasswordForm />
      </div>
      <div className="border-t pt-5">
        <DeleteAccountDialog />
      </div>
    </div>
  );
}
