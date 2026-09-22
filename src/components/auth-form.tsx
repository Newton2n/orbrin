"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type InputHTMLAttributes, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  forgotPassword,
  login,
  registerMember,
  registerOwner,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
} from "../actions/auth.action";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";

const schemas = {
  login: z.object({
    email: z.string().trim().email("Enter a valid email address."),
    password: z.string().min(1, "Enter your password."),
  }),
  register: z.object({
    fullName: z.string().trim().min(1, "Enter your full name."),
    email: z.string().trim().email("Enter a valid email address."),
    password: z.string().min(6, "Use at least 6 characters."),
    organizationName: z.string().trim().min(1, "Enter an organization name."),
    organizationSlug: z
      .string()
      .trim()
      .min(1, "Enter an organization slug.")
      .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens."),
  }),
  member: z.object({
    fullName: z.string().trim().min(1, "Enter your full name."),
    email: z.string().trim().email("Enter a valid email address."),
    password: z.string().min(6, "Use at least 6 characters."),
    organizationId: z.string().trim().min(1, "Enter your organization ID."),
  }),
  forgot: z.object({
    email: z.string().trim().email("Enter a valid email address."),
  }),
  reset: z.object({
    email: z.string().trim().email("Enter a valid email address."),
    otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit verification code."),
    password: z.string().min(8, "Use at least 8 characters."),
  }),
  verify: z.object({
    email: z.string().trim().email("Enter a valid email address."),
    otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit verification code."),
  }),
} as const;

type Mode = keyof typeof schemas;
type Values = Record<string, string>;

const copy: Record<
  Mode,
  { title: string; description: string; action: string }
> = {
  login: {
    title: "Welcome back",
    description: "Sign in to continue to your workspace.",
    action: "Sign in",
  },
  register: {
    title: "Create your workspace",
    description: "Set up an organization for your team.",
    action: "Create workspace",
  },
  member: {
    title: "Join your organization",
    description: "Create your member account.",
    action: "Join organization",
  },
  forgot: {
    title: "Reset your password",
    description: "We’ll send instructions to your email.",
    action: "Send reset instructions",
  },
  reset: {
    title: "Choose a new password",
    description: "Use the code from your reset email.",
    action: "Update password",
  },
  verify: {
    title: "Verify your email",
    description: "Enter the code from your verification email.",
    action: "Verify email",
  },
};

const fields: Record<
  Mode,
  Array<{
    name: string;
    label: string;
    type?: string;
    autoComplete?: string;
    placeholder?: string;
    inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  }>
> = {
  login: [
    {
      name: "email",
      label: "Email",
      type: "email",
      autoComplete: "email",
      placeholder: "you@company.com",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      autoComplete: "current-password",
      placeholder: "••••••••",
    },
  ],
  register: [
    {
      name: "fullName",
      label: "Full name",
      autoComplete: "name",
      placeholder: "John Doe",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      autoComplete: "email",
      placeholder: "you@company.com",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      autoComplete: "new-password",
      placeholder: "••••••••",
    },
    {
      name: "organizationName",
      label: "Organization name",
      placeholder: "Acme Inc",
    },
    {
      name: "organizationSlug",
      label: "Organization slug",
      placeholder: "acme-team",
    },
  ],
  member: [
    {
      name: "fullName",
      label: "Full name",
      autoComplete: "name",
      placeholder: "John Doe",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      autoComplete: "email",
      placeholder: "you@company.com",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      autoComplete: "new-password",
      placeholder: "••••••••",
    },
    {
      name: "organizationId",
      label: "Organization ID",
      placeholder: "org_123",
    },
  ],
  forgot: [
    {
      name: "email",
      label: "Email",
      type: "email",
      autoComplete: "email",
      placeholder: "you@company.com",
    },
  ],
  reset: [
    {
      name: "email",
      label: "Email",
      type: "email",
      autoComplete: "email",
      placeholder: "you@company.com",
    },
    {
      name: "otp",
      label: "Verification code",
      inputMode: "numeric",
      placeholder: "123456",
    },
    {
      name: "password",
      label: "New password",
      type: "password",
      autoComplete: "new-password",
      placeholder: "••••••••",
    },
  ],
  verify: [
    {
      name: "email",
      label: "Email",
      type: "email",
      autoComplete: "email",
      placeholder: "you@company.com",
    },
    {
      name: "otp",
      label: "Verification code",
      inputMode: "numeric",
      placeholder: "123456",
    },
  ],
};

interface AuthFormProps {
  mode: Mode;
  onSuccess?: () => void;
}

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const config = copy[mode];
  const form = useForm<Values>({
    resolver: zodResolver(schemas[mode]) as never,
    defaultValues: Object.fromEntries(
      fields[mode].map((field) => [field.name, ""]),
    ),
    mode: "onBlur",
  });

  async function submit(values: Values) {
    try {
      if (mode === "login") {
        const result = await login({
          email: values.email,
          password: values.password,
        });
        if (!result.success) throw new Error(result.message);
        router.push("/dashboard");
        return;
      }
      if (mode === "register") {
        const result = await registerOwner({
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          organizationName: values.organizationName,
          organizationSlug: values.organizationSlug,
        });
        if (!result.success) throw new Error(result.message);
      } else if (mode === "member") {
        const result = await registerMember({
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          organizationId: values.organizationId,
        });
        if (!result.success) throw new Error(result.message);
      } else if (mode === "verify") {
        const result = await verifyEmail({
          email: values.email,
          otp: values.otp,
        });
        if (!result.success) throw new Error(result.message);
      } else if (mode === "forgot") {
        const result = await forgotPassword(values.email);
        if (!result.success) throw new Error(result.message);

        toast.success("Instructions sent", {
          description: "If the account exists, instructions have been sent.",
        });

        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/reset-password");
        }
        return;
      } else if (mode === "reset") {
        const result = await resetPassword(values);
        if (!result.success) throw new Error(result.message);
      }

      setSuccess(true);
      toast.success(
        mode === "verify" || mode === "reset"
          ? "Password updated"
          : "Request completed",
      );

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error("Request failed", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  if (success)
    return (
      <div className="relative min-h-screen w-full bg-white dark:bg-zinc-950">
        <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid w-full max-w-sm grid-cols-1 gap-6">
            <Card className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <CardHeader className="px-5 pt-5 sm:px-6 sm:pt-6">
                <CardTitle className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {mode === "verify"
                    ? "Email verified"
                    : mode === "reset"
                      ? "Password updated"
                      : "Check your inbox"}
                </CardTitle>
                <CardDescription className="text-sm text-zinc-500 dark:text-zinc-400">
                  Your request was accepted by the server. Follow the next steps
                  in your email.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
                <Button
                  asChild
                  className="h-11 w-full rounded-md bg-zinc-900 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                >
                  <Link href="/login">Return to sign in</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-zinc-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-sm grid-cols-1 gap-6">
          {/* Brand + title */}
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
                Orbrin
              </p>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
              {config.title}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
              {config.description}
            </p>
          </div>

          {/* Card */}
          <Card className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <CardHeader className="px-5 pt-5 sm:px-6 sm:pt-6">
              <CardTitle className="sr-only">{config.title}</CardTitle>
              <CardDescription className="sr-only">
                {config.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(submit)}
                  className="space-y-4"
                >
                  {fields[mode].map((field) => (
                    <FormField
                      key={field.name}
                      control={form.control}
                      name={field.name}
                      render={({ field: control }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-xs font-medium tracking-wide text-zinc-700 dark:text-zinc-300">
                              {field.label}
                            </FormLabel>
                            {mode === "login" && field.name === "password" && (
                              <Link
                                href="/forgot-password"
                                className="text-xs text-zinc-500 underline-offset-4 transition hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
                              >
                                Forgot password?
                              </Link>
                            )}
                          </div>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...control}
                                type={
                                  field.type === "password" && showPassword
                                    ? "text"
                                    : field.type
                                }
                                autoComplete={field.autoComplete}
                                placeholder={field.placeholder}
                                inputMode={
                                  field.inputMode as "numeric" | undefined
                                }
                                className="h-11 rounded-md border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-0 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600"
                              />
                              {field.type === "password" && (
                                <button
                                  type="button"
                                  aria-label={
                                    showPassword
                                      ? "Hide password"
                                      : "Show password"
                                  }
                                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-500 transition hover:text-zinc-800 focus:outline-none focus:ring-0 dark:text-zinc-400 dark:hover:text-zinc-200"
                                  onClick={() =>
                                    setShowPassword((value) => !value)
                                  }
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  ))}
                  <Button
                    type="submit"
                    className="mt-1 h-11 w-full rounded-md bg-zinc-900 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {config.action}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {mode === "login" ? (
                    <>
                      New to Orbrin?{" "}
                      <Link
                        className="font-medium text-zinc-900 underline-offset-4 transition hover:underline dark:text-zinc-100"
                        href="/register"
                      >
                        Create a workspace
                      </Link>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <Link
                        className="font-medium text-zinc-900 underline-offset-4 transition hover:underline dark:text-zinc-100"
                        href="/login"
                      >
                        Sign in
                      </Link>
                    </>
                  )}
                </p>
              </div>

              {/* Resend button for verification */}
              {mode === "verify" && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    className="text-xs text-zinc-500 underline-offset-4 transition hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
                    onClick={() =>
                      sendVerificationEmail(form.getValues("email"))
                        .then((result) => {
                          if (!result.success) throw new Error(result.message);
                          toast.success(
                            "If the account exists and requires verification, a verification code has been sent.",
                          );
                        })
                        .catch((error) =>
                          toast.error("Unable to resend", {
                            description:
                              error instanceof Error
                                ? error.message
                                : "Please try again.",
                          }),
                        )
                    }
                  >
                    Resend verification email
                  </button>
                </div>
              )}

              {/* Resend button for reset password */}
              {mode === "reset" && (
                <div className="mt-4 text-center">
                  <Link
                    href="/forgot-password"
                    className="text-xs text-zinc-500 underline-offset-4 transition hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    Didn&apos;t get a code? Send again
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <p className="mx-auto max-w-xs text-center text-xs text-zinc-400 dark:text-zinc-500">
            By continuing, you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;
