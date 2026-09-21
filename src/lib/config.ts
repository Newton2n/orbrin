export const appConfig = {
  apiUrl:
    process.env.NEXT_PUBLIC_API_URL ?? "https://orbrin-api.vercel.app/api/v1",
} as const;

export function requireApiUrl() {
  return appConfig.apiUrl;
}
