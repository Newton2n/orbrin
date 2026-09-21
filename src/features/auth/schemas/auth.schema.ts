import { z } from "zod";

export const registerOwnerSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your full name."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(6, "Use at least 6 characters."),
  organizationName: z.string().trim().min(1, "Enter an organization name."),
  organizationSlug: z
    .string()
    .trim()
    .min(1, "Enter an organization slug.")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens."),
});

export const registerMemberSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your full name."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(6, "Use at least 6 characters."),
  organizationId: z.string().trim().min(1, "Enter your organization ID."),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const googleLoginSchema = z.object({
  idToken: z.string().min(1),
  organizationId: z.string().uuid().optional(),
});

export const sendVerificationSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

export const verifyEmailSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit verification code."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterOwnerInput = z.infer<typeof registerOwnerSchema>;
export type RegisterMemberInput = z.infer<typeof registerMemberSchema>;
export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;
