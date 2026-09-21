"use server";

import { revalidatePath } from "next/cache";
import {
  actionFailure,
  actionSuccess,
  backendMessage,
  backendRequest,
  unwrapPayload,
} from "../lib/server/backend-api";

export async function getOrganization() {
  const result = await backendRequest<unknown>("/organizations/me");
  return result.ok
    ? actionSuccess(unwrapPayload(result.payload))
    : actionFailure(
        backendMessage(result.payload, "Unable to fetch organization."),
        null,
      );
}

export async function getOrganizationMembers() {
  const result = await backendRequest<unknown>("/organizations/members");
  return result.ok
    ? actionSuccess(unwrapPayload(result.payload))
    : actionFailure(
        backendMessage(result.payload, "Unable to fetch members."),
        [],
      );
}

export async function updateOrganization(input: Record<string, unknown>) {
  const result = await backendRequest<unknown>("/organizations/me", {
    method: "PATCH",
    body: input,
  });
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to update organization."),
      null,
    );
  revalidatePath("/dashboard/team");
  return actionSuccess(unwrapPayload(result.payload));
}
