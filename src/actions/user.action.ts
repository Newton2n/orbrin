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
  return actionSuccess(unwrapPayload(result.payload));
}
