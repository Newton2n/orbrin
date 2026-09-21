import { useAuthStore } from "@/store/use-auth-store";

export const authToken = {
  get: () => useAuthStore.getState().accessToken,
  set: (token: string | null) => useAuthStore.getState().setAccessToken(token),
  clear: () => useAuthStore.getState().logout(),
};
