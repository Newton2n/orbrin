"use server";

import {
  actionFailure,
  actionSuccess,
  backendMessage,
  backendRequest,
  unwrapPayload,
} from "../lib/server/backend-api";
import { z } from "zod";

export type SubscriptionStatus = "PENDING" | "ACTIVE" | "CANCELED" | "EXPIRED";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export type SubscriptionPayment = {
  id: string;
  organizationId: string;
  subscriptionId: string | null;
  gateway: string;
  transactionId: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  invoiceUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SubscriptionHistory = {
  id: string;
  organizationId: string;
  planName: string;
  status: SubscriptionStatus;
  gateway: string;
  subscriptionId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
  updatedAt: string;
  payments: SubscriptionPayment[];
};

export type SubscriptionPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type CheckoutResponse = {
  url: string;
};

const subscriptionHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),

  search: z
    .string()
    .trim()
    .max(100, "Search must be less than 100 characters.")
    .optional(),

  sortBy: z.enum(["createdAt", "updatedAt"]).default("createdAt"),

  sortOrder: z.enum(["asc", "desc"]).default("desc"),

  status: z.enum(["PENDING", "COMPLETED", "FAILED", "REFUNDED"]).optional(),
});

export type SubscriptionHistoryQuery = z.infer<
  typeof subscriptionHistoryQuerySchema
>;

export async function getSubscriptionHistory(
  input: Partial<SubscriptionHistoryQuery> = {},
) {
  const parsed = subscriptionHistoryQuerySchema.safeParse(input);

  if (!parsed.success) {
    return actionFailure(
      parsed.error.issues[0]?.message ?? "Invalid subscription filters.",
      null,
    );
  }

  const params = new URLSearchParams();

  params.set("page", String(parsed.data.page));
  params.set("limit", String(parsed.data.limit));
  params.set("sortBy", parsed.data.sortBy);
  params.set("sortOrder", parsed.data.sortOrder);

  if (parsed.data.status) {
    params.set("status", parsed.data.status);
  }

  if (parsed.data.search) {
    params.set("search", parsed.data.search);
  }

  const result = await backendRequest<unknown>(
    `/subscriptions/history?${params.toString()}`,
  );

  if (!result.ok) {
    return actionFailure(
      backendMessage(result.payload, "Unable to fetch subscription history."),
      null,
    );
  }

  return actionSuccess(
    unwrapPayload<SubscriptionHistory>(result.payload),
    "Subscription history retrieved successfully.",
  );
}

export async function createCheckout() {
  const result = await backendRequest<unknown>("/subscriptions/checkout", {
    method: "POST",
    body: {},
  });

  if (!result.ok) {
    return actionFailure(
      backendMessage(result.payload, "Unable to start checkout."),
      null,
    );
  }

  return actionSuccess(
    unwrapPayload<CheckoutResponse>(result.payload),
    "Checkout session created successfully.",
  );
}
