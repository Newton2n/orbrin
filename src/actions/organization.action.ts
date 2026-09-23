"use server";

import { revalidatePath } from "next/cache";
import {
  actionFailure,
  actionSuccess,
  backendMessage,
  backendRequest,
  unwrapPayload,
} from "../lib/server/backend-api";

export type OrganizationRole = "ADMIN" | "MANAGER" | "MEMBER";

export type OrganizationMembershipStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export type Organization = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  logoPublicId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

export type OrganizationMemberUser = {
  id: string;
  fullName: string;
  email: string;
  profileImageUrl?: string | null;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  emailVerified?: boolean;
  [key: string]: unknown;
};

export type OrganizationMember = {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  status: OrganizationMembershipStatus;
  createdAt?: string;
  updatedAt?: string;
  user?: OrganizationMemberUser;
  [key: string]: unknown;
};

export type OrganizationMemberListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "role";
  sortOrder?: "asc" | "desc";
  role?: OrganizationRole;
  status?: OrganizationMembershipStatus;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ActionResult<T> = {
  success: boolean;
  message: string;
  data: T;
};

function revalidateOrganizationPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin/organization");
  revalidatePath("/dashboard/admin/settings");
  revalidatePath("/dashboard/admin/members");
  revalidatePath("/dashboard/profile");
}

function normalizeMembers(
  payload: unknown,
): PaginatedResponse<OrganizationMember> {
  const raw = payload && typeof payload === "object" ? payload : {};
  const rawRecord = raw as Record<string, unknown>;
  const source = unwrapPayload<unknown>(payload);
  const value = source && typeof source === "object" ? source : {};
  const record = value as Record<string, unknown>;
  const nested =
    record.data && typeof record.data === "object"
      ? (record.data as Record<string, unknown>)
      : record;
  const items = Array.isArray(nested.items)
    ? nested.items
    : Array.isArray(nested.members)
      ? nested.members
      : Array.isArray(nested.data)
        ? nested.data
        : Array.isArray(source)
          ? source
          : [];
  const pagination =
    nested.pagination && typeof nested.pagination === "object"
      ? (nested.pagination as Record<string, unknown>)
      : rawRecord.pagination && typeof rawRecord.pagination === "object"
        ? (rawRecord.pagination as Record<string, unknown>)
        : record.pagination && typeof record.pagination === "object"
          ? (record.pagination as Record<string, unknown>)
          : {};
  const page = Number(pagination.page ?? nested.page ?? record.page ?? 1);
  const limit = Number(pagination.limit ?? nested.limit ?? record.limit ?? 10);
  const total = Number(
    pagination.total ?? nested.total ?? record.total ?? items.length,
  );
  const totalPages = Number(
    pagination.totalPages ??
      nested.totalPages ??
      record.totalPages ??
      Math.max(1, Math.ceil(total / Math.max(1, limit))),
  );

  return {
    items: items as OrganizationMember[],
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getMyOrganization(): Promise<
  ActionResult<Organization | null>
> {
  const result = await backendRequest<unknown>("/organizations/me");
  return result.ok
    ? actionSuccess(unwrapPayload<Organization | null>(result.payload))
    : actionFailure(
        backendMessage(result.payload, "Unable to fetch organization."),
        null,
      );
}

export const getOrganization = getMyOrganization;

export async function getOrganizationMembers(
  params: OrganizationMemberListParams = {},
): Promise<ActionResult<PaginatedResponse<OrganizationMember>>> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const endpoint = query.size
    ? `/organizations/members?${query.toString()}`
    : "/organizations/members";
  const result = await backendRequest<unknown>(endpoint);
  return result.ok
    ? actionSuccess(normalizeMembers(result.payload))
    : actionFailure(
        backendMessage(result.payload, "Unable to fetch members."),
        { items: [], total: 0, page: 1, limit: 10, totalPages: 0 },
      );
}

export async function updateOrganization(input: {
  name?: string;
  slug?: string;
}): Promise<ActionResult<Organization | null>> {
  const result = await backendRequest<unknown>("/organizations/me", {
    method: "PATCH",
    body: input,
  });
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to update organization."),
      null,
    );
  revalidateOrganizationPaths();
  return actionSuccess(
    unwrapPayload<Organization | null>(result.payload),
    "Organization updated.",
  );
}

export async function deleteOrganization(): Promise<ActionResult<null>> {
  const result = await backendRequest<null>("/organizations/me", {
    method: "DELETE",
  });
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to delete organization."),
      null,
    );
  revalidateOrganizationPaths();
  return actionSuccess(null, "Organization deleted.");
}

export async function getOrganizationMemberById(
  memberId: string,
): Promise<ActionResult<OrganizationMember | null>> {
  const result = await backendRequest<unknown>(
    `/organizations/members/${memberId}`,
  );
  return result.ok
    ? actionSuccess(unwrapPayload<OrganizationMember | null>(result.payload))
    : actionFailure(
        backendMessage(result.payload, "Unable to fetch member."),
        null,
      );
}

export async function updateOrganizationMemberRole(
  memberId: string,
  role: "MANAGER" | "MEMBER",
): Promise<ActionResult<OrganizationMember | null>> {
  const result = await backendRequest<unknown>(
    `/organizations/members/${memberId}/role`,
    { method: "PATCH", body: { role } },
  );
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to update member role."),
      null,
    );
  revalidateOrganizationPaths();
  return actionSuccess(
    unwrapPayload<OrganizationMember | null>(result.payload),
    "Member role updated.",
  );
}

export async function updateOrganizationMemberStatus(
  memberId: string,
  status: OrganizationMembershipStatus,
): Promise<ActionResult<OrganizationMember | null>> {
  const result = await backendRequest<unknown>(
    `/organizations/members/${memberId}/status`,
    { method: "PATCH", body: { status } },
  );
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to update member status."),
      null,
    );
  revalidateOrganizationPaths();
  return actionSuccess(
    unwrapPayload<OrganizationMember | null>(result.payload),
    "Member status updated.",
  );
}

export async function removeOrganizationMember(
  memberId: string,
): Promise<ActionResult<null>> {
  const result = await backendRequest<null>(
    `/organizations/members/${memberId}`,
    { method: "DELETE" },
  );
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to remove member."),
      null,
    );
  revalidateOrganizationPaths();
  return actionSuccess(null, "Member removed.");
}

export async function leaveOrganization(): Promise<ActionResult<null>> {
  const result = await backendRequest<null>("/organizations/leave", {
    method: "POST",
  });
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to leave organization."),
      null,
    );
  revalidateOrganizationPaths();
  return actionSuccess(null, "You left the organization.");
}

export async function updateOrganizationLogo(
  image: File,
): Promise<ActionResult<Organization | null>> {
  const formData = new FormData();
  formData.append("image", image);
  const result = await backendRequest<unknown>("/organizations/me/logo", {
    method: "PATCH",
    body: formData,
  });
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to update organization logo."),
      null,
    );
  revalidateOrganizationPaths();
  return actionSuccess(
    unwrapPayload<Organization | null>(result.payload),
    "Organization logo updated.",
  );
}

export async function deleteOrganizationLogo(): Promise<ActionResult<null>> {
  const result = await backendRequest<null>("/organizations/me/logo", {
    method: "DELETE",
  });
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to delete organization logo."),
      null,
    );
  revalidateOrganizationPaths();
  return actionSuccess(null, "Organization logo deleted.");
}
