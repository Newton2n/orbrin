"use server";

import { revalidatePath } from "next/cache";
import {
  actionFailure,
  actionSuccess,
  backendMessage,
  backendRequest,
  unwrapPayload,
} from "../lib/server/backend-api";

export async function getUserProfile() {
  const result = await backendRequest<unknown>("/users/me");
  return result.ok
    ? actionSuccess(unwrapPayload(result.payload))
    : actionFailure(
        backendMessage(result.payload, "Unable to fetch profile."),
        null,
      );
}

export async function updateUserProfile(input: Record<string, unknown>) {
  const result = await backendRequest<unknown>("/users/me", {
    method: "PATCH",
    body: input,
  });
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to update profile."),
      null,
    );
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  return actionSuccess(unwrapPayload(result.payload));
}

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  profileImageUrl?: string | null;
  role?: string;
  status?: string;
  [key: string]: unknown;
};

export async function getMyProfile() {
  const result = await backendRequest<UserProfile>("/users/me");
  return result.ok
    ? actionSuccess(unwrapPayload<UserProfile>(result.payload))
    : actionFailure(
        backendMessage(result.payload, "Unable to fetch profile."),
        null,
      );
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}) {
  const result = await backendRequest<null>("/users/me/password", {
    method: "PATCH",
    body: input,
  });
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to change password."),
      null,
    );
  return actionSuccess(null, "Password changed.");
}

export async function deleteMyAccount() {
  const result = await backendRequest<null>("/users/me", { method: "DELETE" });
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to delete account."),
      null,
    );
  revalidatePath("/dashboard");
  return actionSuccess(null, "Account deleted.");
}

export async function updateProfileImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);
  const result = await backendRequest<UserProfile>(
    "/users/me/profile-picture",
    { method: "PATCH", body: formData },
  );
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to update profile picture."),
      null,
    );
  revalidatePath("/dashboard/profile");
  return actionSuccess(
    unwrapPayload<UserProfile>(result.payload),
    "Profile picture updated.",
  );
}

export async function deleteProfileImage() {
  const result = await backendRequest<null>("/users/me/profile-picture", {
    method: "DELETE",
  });
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to delete profile picture."),
      null,
    );
  revalidatePath("/dashboard/profile");
  return actionSuccess(null, "Profile picture deleted.");
}

export async function updateUserStatus(
  userId: string,
  input: { status: string },
) {
  const result = await backendRequest<UserProfile>(`/users/${userId}/status`, {
    method: "PATCH",
    body: input,
  });
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to update user status."),
      null,
    );
  return actionSuccess(
    unwrapPayload<UserProfile>(result.payload),
    "User status updated.",
  );
}
