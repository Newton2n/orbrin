export const appConfig = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
} as const;

export function requireApiUrl() {
  return appConfig.apiUrl;
}
