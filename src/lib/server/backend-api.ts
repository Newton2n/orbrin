import { cookies } from "next/headers";

function getBackendUrl() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API
    ? process.env.NEXT_PUBLIC_BACKEND_API
    : "https://orbrin-api.vercel.app/api/v1";
  return backendUrl?.replace(/\/$/, "");
}

type BackendRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export type BackendResult<T> = {
  ok: boolean;
  status: number;
  payload: T | null;
};

function isBodyInit(body: unknown): body is BodyInit {
  return (
    typeof body === "string" ||
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer
  );
}

export async function backendRequest<T>(
  endpoint: string,
  options: BackendRequestOptions = {},
): Promise<BackendResult<T>> {
  const cookieHeader = (await cookies())
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");

  const { body, headers: customHeaders, ...requestInit } = options;
  const headers = new Headers(customHeaders);
  const serializedBody =
    body === undefined || isBodyInit(body) ? body : JSON.stringify(body);

  if (body !== undefined && !isBodyInit(body) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");
  if (cookieHeader) headers.set("Cookie", cookieHeader);

  const backendUrl = getBackendUrl();
  if (!backendUrl) {
    return { ok: false, status: 503, payload: null };
  }

  try {
    const response = await fetch(`${backendUrl}${endpoint}`, {
      ...requestInit,
      body: serializedBody,
      cache: "no-store",
      headers,
    });
    const contentType = response.headers.get("content-type") ?? "";
    const payload =
      response.status === 204
        ? null
        : contentType.includes("application/json")
          ? await response.json().catch(() => null)
          : await response.text().catch(() => null);

    return { ok: response.ok, status: response.status, payload: payload as T };
  } catch {
    return { ok: false, status: 503, payload: null };
  }
}

export function actionFailure<T>(message: string, data: T) {
  return { success: false as const, message, data };
}

export function actionSuccess<T>(data: T, message = "Request completed") {
  return { success: true as const, message, data };
}

export function backendMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const source = payload as Record<string, unknown>;
  return typeof source.message === "string"
    ? source.message
    : typeof source.error === "string"
      ? source.error
      : fallback;
}

export function unwrapPayload<T>(payload: unknown): T {
  if (payload && typeof payload === "object") {
    const source = payload as Record<string, unknown>;
    if ("data" in source) return source.data as T;
    if ("result" in source) return source.result as T;
  }
  return payload as T;
}
