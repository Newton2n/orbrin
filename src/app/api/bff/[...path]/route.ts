import { NextResponse } from "next/server";

import { backendRequest } from "@/lib/server/backend-api";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const allowedPrefixes = [
    ["teams"],
    ["projects"],
    ["sprints"],
    ["tasks"],
    ["comments", "tasks"],
    ["organizations", "members"],
    ["organizations", "me"],
    ["users", "me"],
    ["stats"],
  ];
  const allowed = allowedPrefixes.some(
    (prefix) =>
      path.length >= prefix.length &&
      prefix.every((segment, index) => path[index] === segment),
  );

  if (!allowed) {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  const pathname = path.map((segment) => encodeURIComponent(segment)).join("/");
  const query = new URL(request.url).search;
  const result = await backendRequest<unknown>(`/${pathname}${query}`);

  return NextResponse.json(result.payload, { status: result.status });
}
