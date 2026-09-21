import { appConfig } from "@/lib/config";
import { ApiError, normalizeApiError } from "@/lib/api-errors";
import { toQueryString, type QueryParams } from "@/lib/query-params";
import { useAuthStore } from "@/store/use-auth-store";

export const API_BASE_URL = appConfig.apiUrl;
export type QueryValue = string | number | boolean | null | undefined;
export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  params?: QueryParams;
  skipAuthRefresh?: boolean;
};

type RefreshResponse = {
  accessToken?: string;
  data?: { accessToken?: string };
  result?: { accessToken?: string };
};
let refreshPromise: Promise<string | null> | null = null;

function isRawBody(body: unknown): body is BodyInit {
  return (
    typeof body === "string" ||
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer
  );
}

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;
  const currentToken = useAuthStore.getState().accessToken;
  refreshPromise = fetch(`${API_BASE_URL}/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
    },
  })
    .then(async (response) => {
      if (!response.ok) return null;
      const payload = (await response
        .json()
        .catch(() => null)) as RefreshResponse | null;
      const token =
        payload?.accessToken ??
        payload?.data?.accessToken ??
        payload?.result?.accessToken ??
        null;
      if (token) useAuthStore.getState().setAccessToken(token);
      return token;
    })
    .catch(() => null)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

async function request<T>(
  endpoint: string,
  options: ApiRequestOptions,
  tokenOverride?: string | null,
) {
  const {
    params,
    body,
    headers: customHeaders,
    skipAuthRefresh,
    ...requestConfig
  } = options;
  const headers = new Headers(customHeaders);
  const serializedBody =
    body === undefined || isRawBody(body) ? body : JSON.stringify(body);
  if (body !== undefined && !isRawBody(body) && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  const token = tokenOverride ?? useAuthStore.getState().accessToken;
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(
    `${API_BASE_URL}${endpoint}${toQueryString(params)}`,
    {
      ...requestConfig,
      body: serializedBody,
      credentials: "include",
      headers,
    },
  );
  const contentType = response.headers.get("content-type") ?? "";
  const payload =
    response.status === 204
      ? null
      : contentType.includes("application/json")
        ? await response.json().catch(() => null)
        : await response.text().catch(() => "");

  if (
    response.status === 401 &&
    !skipAuthRefresh &&
    endpoint !== "/auth/refresh-token"
  ) {
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken)
      return request<T>(
        endpoint,
        { ...options, skipAuthRefresh: true },
        refreshedToken,
      );
    useAuthStore.getState().logout();
  }
  if (!response.ok) throw normalizeApiError(response.status, payload);
  return payload as T;
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
) {
  return request<T>(endpoint, options);
}

export { ApiError };
