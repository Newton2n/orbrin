import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/features/auth/types/auth.types";

interface AuthState {
  accessToken: string | null;
  organizationId: string | null;
  user: AuthUser | null;
  setSession: (session: AuthSession) => void;
  setAccessToken: (token: string | null) => void;
  setOrganizationId: (orgId: string | null) => void;
  logout: () => void;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  organizationId: string;
}

export interface AuthSession {
  accessToken: string;
  organizationId: string;
  user: AuthUser;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      organizationId: null,
      user: null,
      setSession: ({ accessToken, organizationId = null, user = null }) =>
        set({ accessToken, organizationId, user }),
      setAccessToken: (token) => set({ accessToken: token }),
      setOrganizationId: (orgId) => set({ organizationId: orgId }),
      logout: () =>
        set({ accessToken: null, organizationId: null, user: null }),
    }),
    {
      name: "orbrin-auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        organizationId: state.organizationId,
        user: state.user,
      }),
    },
  ),
);
