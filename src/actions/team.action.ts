"use server";

import {
  actionFailure,
  actionSuccess,
  backendMessage,
  backendRequest,
  unwrapPayload,
} from "../lib/server/backend-api";

export async function getTeams() {
  const result = await backendRequest<unknown>("/teams");
  return result.ok
    ? actionSuccess(unwrapPayload(result.payload))
    : actionFailure(
        backendMessage(result.payload, "Unable to fetch teams."),
        [],
      );
}
