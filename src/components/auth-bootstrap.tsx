"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useAuthStore } from "@/store/use-auth-store";

const authPaths = [
  "/login",
  "/register",
  "/register-owner",
  "/register/member",
  "/member-signup",
  "/organization-register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const accessToken = useAuthStore((state) => state.accessToken);
  const currentUser = useCurrentUser();
  const isAuthPage = authPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const isDashboard = pathname.startsWith("/dashboard");

  useEffect(() => {
    if (!accessToken && isDashboard) {
      router.replace("/login");
      return;
    }
    if (currentUser.isError && accessToken) {
      logout();
      return;
    }
    if (currentUser.isSuccess && isAuthPage) router.replace("/dashboard");
    if (currentUser.isError && isDashboard) router.replace("/login");
  }, [
    accessToken,
    currentUser.isError,
    currentUser.isSuccess,
    isAuthPage,
    isDashboard,
    logout,
    router,
  ]);

  if (
    ((isDashboard || isAuthPage) && !accessToken && isDashboard) ||
    currentUser.isPending ||
    (Boolean(accessToken) && !currentUser.isFetched)
  ) {
    return (
      <div className="grid min-h-svh place-items-center bg-background px-6">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Checking your session...
        </p>
      </div>
    );
  }

  return children;
}
