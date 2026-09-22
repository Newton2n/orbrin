"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  googleLoginSchema,
  loginSchema,
  registerMemberSchema,
  registerOwnerSchema,
  resetSchema,
  verifyEmailSchema,
} from "../features/auth/schemas/auth.schema";
import type {
  AuthUser,
  LoginResponse,
  RegisterMemberResponse,
  RegisterOwnerResponse,
  VerifyEmailResponse,
} from "../features/auth/types/auth.types";
import {
  actionFailure,
  actionSuccess,
  backendMessage,
  backendRequest,
  unwrapPayload,
} from "../lib/server/backend-api";
import { jwtUtils } from "../utils/jwt";

function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

async function saveSession(payload: LoginResponse) {
  const cookieStore = await cookies();
  const options = sessionCookieOptions();
  cookieStore.set("accessToken", payload.accessToken, options);
  if (payload.refreshToken)
    cookieStore.set("refreshToken", payload.refreshToken, options);
}

export async function getNewAccessToken() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value || null;

  if (!refreshToken) {
    return {
      success: false,
      message: "Refresh token not found!",
    };
  }

  try {
    const res = await fetch(
      `${process.env.BACKEND_API}/auth/refresh-token`,
      {
        method: "POST",
        headers: {
          Cookie: `refreshToken=${refreshToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-cache",
      },
    );

    const result = await res.json();

    // If backend returns a new access token, save it automatically
    if (res.ok && result?.data?.accessToken) {
      const options = sessionCookieOptions();
      cookieStore.set("accessToken", result.data.accessToken, options);
    }

    return result;
  } catch (error) {
    return {
      success: false,
      message: "Failed to refresh token network error.",
    };
  }
}

export async function hasValidAccessToken(): Promise<boolean> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const secret = process.env.JWT_ACCESS_SECRET;

  if (
    accessToken &&
    secret &&
    jwtUtils.verifyToken(accessToken, secret).success
  ) {
    return true;
  }

  // Access token is missing or expired, try refreshing via refreshToken
  const refreshResult = await getNewAccessToken();
  return refreshResult.success === true;
}

// Login function
export async function login(input: unknown) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return actionFailure("Invalid login details.", null);
  const result = await backendRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: parsed.data,
  });

  console.log("login result:", result);

  if (!result.ok || !result.payload) {
    return actionFailure(
      backendMessage(result.payload, "Unable to sign in."),
      null,
    );
  }
  const payload = unwrapPayload<LoginResponse>(result.payload);
  await saveSession(payload);
  return actionSuccess(payload, "Welcome back.");
}

// Register owner function
export async function registerOwner(input: unknown) {
  const parsed = registerOwnerSchema.safeParse(input);
  if (!parsed.success)
    return actionFailure("Invalid registration details.", null);
  const result = await backendRequest<RegisterOwnerResponse>(
    "/auth/register-owner",
    {
      method: "POST",
      body: parsed.data,
    },
  );
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to create workspace."),
      null,
    );
  return actionSuccess(
    unwrapPayload<RegisterOwnerResponse>(result.payload),
    "Workspace created.",
  );
}

// Register member function
export async function registerMember(input: unknown) {
  const parsed = registerMemberSchema.safeParse(input);
  if (!parsed.success)
    return actionFailure("Invalid registration details.", null);
  const result = await backendRequest<RegisterMemberResponse>(
    "/auth/register-member",
    {
      method: "POST",
      body: parsed.data,
    },
  );
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to create member account."),
      null,
    );
  return actionSuccess(
    unwrapPayload<RegisterMemberResponse>(result.payload),
    "Account created.",
  );
}

// Google login function
export async function googleLogin(input: unknown) {
  const parsed = googleLoginSchema.safeParse(input);
  if (!parsed.success)
    return actionFailure("Invalid Google login details.", null);
  const result = await backendRequest<LoginResponse>("/auth/google-login", {
    method: "POST",
    body: parsed.data,
  });
  if (!result.ok || !result.payload)
    return actionFailure(
      backendMessage(result.payload, "Unable to sign in with Google."),
      null,
    );
  const payload = unwrapPayload<LoginResponse>(result.payload);
  await saveSession(payload);
  return actionSuccess(payload, "Welcome back.");
}

// Get current user function
export async function getCurrentUser() {
  if (!(await hasValidAccessToken()))
    return actionFailure("You are not authenticated.", null);

  const result = await backendRequest<AuthUser>("/auth/me");
  if (!result.ok || !result.payload)
    return actionFailure(
      backendMessage(result.payload, "You are not authenticated."),
      null,
    );
  return actionSuccess(unwrapPayload<AuthUser>(result.payload));
}

// Logout function
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  redirect("/login");
}

// Send verification email function
export async function sendVerificationEmail(email: string) {
  const result = await backendRequest("/auth/send-verification-email", {
    method: "POST",
    body: { email },
  });
  return result.ok
    ? actionSuccess(null, "Verification email sent.")
    : actionFailure(
        backendMessage(result.payload, "Unable to send verification email."),
        null,
      );
}

// Verify email function
export async function verifyEmail(input: unknown) {
  const parsed = verifyEmailSchema.safeParse(input);
  if (!parsed.success)
    return actionFailure("Invalid verification details.", null);
  const result = await backendRequest<VerifyEmailResponse>(
    "/auth/verify-email",
    { method: "POST", body: parsed.data },
  );
  return result.ok
    ? actionSuccess(
        unwrapPayload<VerifyEmailResponse>(result.payload),
        "Email verified.",
      )
    : actionFailure(
        backendMessage(result.payload, "Unable to verify email."),
        null,
      );
}

// Forgot password function
export async function forgotPassword(email: string) {
  const result = await backendRequest("/users/forgot-password", {
    method: "POST",
    body: { email },
  });
  return result.ok
    ? actionSuccess(null, "Password reset instructions sent.")
    : actionFailure(
        backendMessage(result.payload, "Unable to start password reset."),
        null,
      );
}

// Reset password function
export async function resetPassword(input: unknown) {
  const parsed = resetSchema.safeParse(input);
  if (!parsed.success)
    return actionFailure("Invalid password reset details.", null);
  const result = await backendRequest("/users/reset-password", {
    method: "POST",
    body: parsed.data,
  });
  return result.ok
    ? actionSuccess(null, "Password updated.")
    : actionFailure(
        backendMessage(result.payload, "Unable to reset password."),
        null,
      );
}
