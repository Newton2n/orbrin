export interface ApiErrorPayload {
  message?: string;
  error?: string;
  details?: unknown;
  [key: string]: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code =
      getPayloadString(payload, "code") ?? getPayloadString(payload, "error");
    this.details = payload;
  }

  get isUnauthorized() {
    return this.status === 401;
  }
}

function getPayloadString(payload: unknown, key: string) {
  if (!payload || typeof payload !== "object") return undefined;
  const value = (payload as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
}

export function getApiErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong while contacting the API.";
}

export function normalizeApiError(status: number, payload: unknown) {
  const message =
    getPayloadString(payload, "message") ??
    getPayloadString(payload, "error") ??
    `Request failed with status ${status}`;
  return new ApiError(message, status, payload);
}
