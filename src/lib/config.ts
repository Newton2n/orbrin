const DEFAULT_API_URL = "https://orbrin-api.vercel.app/api/v1";

export const appConfig = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || DEFAULT_API_URL,
} as const;

export function requireApiUrl() {
  return appConfig.apiUrl;
}
