import { apiClient } from "@/lib/api-client";
import type {
  AuthUser,
  LoginResponse,
  RefreshTokenResponse,
  RegisterMemberResponse,
  RegisterOwnerResponse,
  VerifyEmailResponse,
} from "@/features/auth/types/auth.types";
import type {
  GoogleLoginInput,
  LoginInput,
  RegisterMemberInput,
  RegisterOwnerInput,
} from "@/features/auth/schemas/auth.schema";

type Envelope<T> = T | { data: T } | { result: T };

function unwrap<T>(response: Envelope<T>): T {
  if (response && typeof response === "object" && "data" in response)
    return response.data;
  if (response && typeof response === "object" && "result" in response)
    return response.result;
  return response as T;
}

export async function login(input: LoginInput) {
  return unwrap(
    await apiClient<Envelope<LoginResponse>>("/auth/login", {
      method: "POST",
      body: input,
    }),
  );
}

export async function registerOwner(input: RegisterOwnerInput) {
  return unwrap(
    await apiClient<Envelope<RegisterOwnerResponse>>("/auth/register-owner", {
      method: "POST",
      body: input,
    }),
  );
}

export async function registerMember(input: RegisterMemberInput) {
  return unwrap(
    await apiClient<Envelope<RegisterMemberResponse>>("/auth/register-member", {
      method: "POST",
      body: input,
    }),
  );
}

export async function googleLogin(input: GoogleLoginInput) {
  return unwrap(
    await apiClient<Envelope<LoginResponse>>("/auth/google-login", {
      method: "POST",
      body: input,
    }),
  );
}

export async function getMe() {
  return unwrap(await apiClient<Envelope<AuthUser>>("/auth/me"));
}

export async function sendVerificationEmail(email: string) {
  return apiClient("/auth/send-verification-email", {
    method: "POST",
    body: { email },
  });
}

export async function verifyEmail(email: string, otp: string) {
  return unwrap(
    await apiClient<Envelope<VerifyEmailResponse>>("/auth/verify-email", {
      method: "POST",
      body: { email, otp },
    }),
  );
}

export async function forgotPassword(email: string) {
  return apiClient("/users/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export async function resetPassword(input: {
  email: string;
  otp: string;
  password: string;
}) {
  return apiClient("/users/reset-password", { method: "POST", body: input });
}

export function normalizeSessionPayload(
  payload: LoginResponse | RefreshTokenResponse,
) {
  return {
    accessToken: payload.accessToken,
    user: {
      id: payload.jwtPayload.id,
      email: payload.jwtPayload.email,
      fullName:
        payload.jwtPayload.fullName ??
        (payload.jwtPayload as unknown as { name: string }).name,
      role: payload.jwtPayload.role,
      organizationId: payload.jwtPayload.organizationId,
    },
  };
}
