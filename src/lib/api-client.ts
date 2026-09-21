import { useAuthStore } from "@/store/use-auth-store";

export const API_BASE_URL = "https://orbrin-api.vercel.app/api/v1";
export type QueryValue = string | number | boolean | null | undefined;
export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  params?: Record<string, QueryValue | QueryValue[]>;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function serializeParams(params: ApiRequestOptions["params"]): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item !== null && item !== undefined)
        searchParams.append(key, String(item));
    }
  }
  return searchParams.toString();
}

function isRawBody(body: unknown): body is BodyInit {
  return (
    typeof body === "string" ||
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer
  );
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { params, body, headers: customHeaders, ...requestConfig } = options;
  const query = serializeParams(params);
  const url = `${API_BASE_URL}${endpoint}${query ? `?${query}` : ""}`;
  const token = useAuthStore.getState().accessToken;
  const headers = new Headers(customHeaders);
  const serializedBody =
    body === undefined || isRawBody(body) ? body : JSON.stringify(body);

  if (body !== undefined && !isRawBody(body) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(url, {
    ...requestConfig,
    body: serializedBody,
    credentials: "include",
    headers,
  });
  const contentType = response.headers.get("content-type") ?? "";
  const responseBody =
    response.status === 204
      ? null
      : contentType.includes("application/json")
        ? await response.json().catch(() => null)
        : await response.text().catch(() => "");

  if (!response.ok) {
    const message =
      typeof responseBody === "object" &&
      responseBody !== null &&
      "message" in responseBody
        ? String(responseBody.message)
        : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, responseBody);
  }
  return responseBody as T;
}
