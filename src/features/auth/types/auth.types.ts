export const UserStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const AuthProvider = { LOCAL: "LOCAL", GOOGLE: "GOOGLE" } as const;
export type AuthProvider = (typeof AuthProvider)[keyof typeof AuthProvider];

export const Role = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  MEMBER: "MEMBER",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const MembershipStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
} as const;
export type MembershipStatus =
  (typeof MembershipStatus)[keyof typeof MembershipStatus];

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export interface OrganizationMembership {
  organizationId: string;
  userId: string;
  role: Role;
  status: MembershipStatus;
  organization: Organization;
}

export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  fullName: string;
  profileImageUrl?: string | null;
  status: UserStatus;
  authProvider: AuthProvider;
  createdAt: string;
  updatedAt: string;
  memberships: OrganizationMembership[];
}

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  organizationId: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: SessionUser;
}

export interface RefreshTokenResponse {
  accessToken: string;
  jwtPayload: SessionUser;
}

export interface RegisterOwnerResponse {
  user: Pick<AuthUser, "id" | "email" | "fullName">;
  organization: Organization;
  role: Role;
}

export interface RegisterMemberResponse {
  user: Pick<AuthUser, "id" | "email" | "fullName">;
  organizationId: string;
  role: Role;
}

export interface VerifyEmailResponse {
  id: string;
  email: string;
  fullName: string;
  emailVerified: boolean;
  status: UserStatus;
  authProvider: AuthProvider;
  createdAt: string;
  updatedAt: string;
}
