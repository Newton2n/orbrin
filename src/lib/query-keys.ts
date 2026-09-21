export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => ["auth", "me"] as const,
  },
  organizations: {
    all: ["organizations"] as const,
    current: () => ["organizations", "current"] as const,
    members: () => ["organizations", "members"] as const,
  },
  projects: {
    all: ["projects"] as const,
    list: (params?: Record<string, unknown>) =>
      ["projects", "list", params ?? {}] as const,
    detail: (projectId: string) => ["projects", "detail", projectId] as const,
  },
  tasks: {
    all: ["tasks"] as const,
    byProject: (projectId: string) => ["tasks", "project", projectId] as const,
  },
  sprints: {
    all: ["sprints"] as const,
    byProject: (projectId: string) =>
      ["sprints", "project", projectId] as const,
  },
  teams: {
    all: ["teams"] as const,
    list: () => ["teams", "list"] as const,
  },
} as const;
