"use server";

import {
  actionFailure,
  actionSuccess,
  backendMessage,
  backendRequest,
  unwrapPayload,
} from "../lib/server/backend-api";

export async function getSubscriptionHistory() {
  const result = await backendRequest<unknown>("/subscriptions/history");
  return result.ok
    ? actionSuccess(unwrapPayload(result.payload))
    : actionFailure(
        backendMessage(result.payload, "Unable to fetch subscription history."),
        [],
      );
}

export async function createCheckout(input: Record<string, unknown>) {
  const result = await backendRequest<unknown>("/subscriptions/checkout", {
    method: "POST",
    body: input,
  });
  return result.ok
    ? actionSuccess(unwrapPayload(result.payload))
    : actionFailure(
        backendMessage(result.payload, "Unable to start checkout."),
        null,
      );
}
