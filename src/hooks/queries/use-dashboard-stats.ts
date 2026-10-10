"use client";

import { useQuery } from "@tanstack/react-query";

import { bffGet } from "@/lib/client/bff";

export type DashboardEnvelope<T> = {
  success: true;
  message: string;
  data: T;
};

export type MemberStats = {
  tasks: {
    total: number;
    todo: number;
    inProgress: number;
    inReview: number;
    completed: number;
    overdue?: number;
  };
  projects: {
    total: number;
  };
  comments: {
    totalAuthored: number;
  };
};

export type OrganizationTaskStatusBreakdown = {
  TODO: number;
  IN_PROGRESS: number;
  REVIEW: number;
  DONE: number;
};

export type OrganizationTaskPriorityBreakdown = {
  LOW: number;
  MEDIUM: number;
  HIGH: number;
  URGENT: number;
};

export type OrganizationSprintStatusBreakdown = {
  PLANNING: number;
  ACTIVE: number;
  COMPLETED: number;
};

export type OrganizationStats = {
  teams: {
    total: number;
  };
  projects: {
    total: number;
  };
  members: {
    total: number;
  };
  tasks: {
    total: number;
    byStatus: OrganizationTaskStatusBreakdown;
    byPriority: OrganizationTaskPriorityBreakdown;
    completed: number;
    overdue?: number;
  };
  sprints: {
    total: number;
    byStatus: OrganizationSprintStatusBreakdown;
  };
  comments: {
    total: number;
  };
};

export type BillingSummary = {
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  refundedPayments: number;
  totalCompletedAmount: number;
  currency: string;
};

export type AdminStats = OrganizationStats & {
  billing: BillingSummary;
};

export type DashboardReportParams = {
  from?: string;
  to?: string;
};

export type DashboardReport = Record<string, unknown>;

export const dashboardQueryKeys = {
  member: ["dashboard-stats", "member"] as const,
  manager: ["dashboard-stats", "manager"] as const,
  admin: ["dashboard-stats", "admin"] as const,
  reports: (params: DashboardReportParams = {}) =>
    ["dashboard-reports", params] as const,
};

function getDashboardQueryString(params: DashboardReportParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.from) {
    searchParams.set("from", params.from);
  }

  if (params.to) {
    searchParams.set("to", params.to);
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

function unwrapDashboardResponse<T>(payload: unknown): T {
  if (!payload || typeof payload !== "object") {
    throw new Error("Unable to load dashboard data.");
  }

  const source = payload as Record<string, unknown>;
  const hasEnvelope =
    "success" in source && "message" in source && "data" in source;

  if (!hasEnvelope) {
    throw new Error("Unexpected dashboard response format.");
  }

  if (source.success !== true) {
    const message =
      typeof source.message === "string"
        ? source.message
        : "Unable to load dashboard data.";
    throw new Error(message);
  }

  if (source.data === undefined || source.data === null) {
    throw new Error("Dashboard data was not returned.");
  }

  return source.data as T;
}

export function useMemberDashboardStats() {
  return useQuery({
    queryKey: dashboardQueryKeys.member,
    queryFn: async () =>
      unwrapDashboardResponse<MemberStats>(
        await bffGet<DashboardEnvelope<MemberStats>>("/stats/member"),
      ),
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useManagerDashboardStats() {
  return useQuery({
    queryKey: dashboardQueryKeys.manager,
    queryFn: async () =>
      unwrapDashboardResponse<OrganizationStats>(
        await bffGet<DashboardEnvelope<OrganizationStats>>("/stats/manager"),
      ),
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useAdminDashboardStats() {
  return useQuery({
    queryKey: dashboardQueryKeys.admin,
    queryFn: async () =>
      unwrapDashboardResponse<AdminStats>(
        await bffGet<DashboardEnvelope<AdminStats>>("/stats/admin"),
      ),
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useDashboardReport(params: DashboardReportParams = {}) {
  const queryString = getDashboardQueryString(params);

  return useQuery({
    queryKey: dashboardQueryKeys.reports(params),
    enabled: Boolean(params.from || params.to),
    queryFn: async () =>
      unwrapDashboardResponse<DashboardReport>(
        await bffGet<DashboardEnvelope<DashboardReport>>(
          `/stats/reports${queryString}`,
        ),
      ),
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
