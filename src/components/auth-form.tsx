"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  UserCheck,
  Users2,
} from "lucide-react";
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
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
} from "../actions/auth.action";
import { GoogleLoginButton } from "./auth/google-login-button";
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

  member: z.object({
    fullName: z.string().trim().min(1, "Enter your full name."),
    email: z.string().trim().email("Enter a valid email address."),
    password: z.string().min(6, "Use at least 6 characters."),
    organizationId: z
      .string()
      .trim()
      .min(1, "A valid invitation is required."),
  }),

  forgot: z.object({
    email: z.string().trim().email("Enter a valid email address."),
  }),

  reset: z.object({
    email: z.string().trim().email("Enter a valid email address."),
    otp: z
      .string()
      .regex(/^\d{6}$/, "Enter the 6-digit verification code."),
    password: z.string().min(8, "Use at least 8 characters."),
  }),

  verify: z.object({
    email: z.string().trim().email("Enter a valid email address."),
    otp: z
      .string()
      .regex(/^\d{6}$/, "Enter the 6-digit verification code."),
  }),
} as const;

type Mode = keyof typeof schemas;

type Values = Record<string, string>;

interface AuthFormProps {
  mode: Mode;
  organizationId?: string;
}

const config: Record<
  Mode,
  {
    title: string;
    description: string;
    action: string;
  }
> = {
  login: {
    title: "Welcome back",
    description: "Sign in to continue to your workspace.",
    action: "Sign in",
  },

  member: {
    title: "Join your team",
    description: "Create your account using your team invitation.",
    action: "Create account",
  },

  forgot: {
    title: "Forgot your password?",
    description: "Enter your email and we'll send you a reset code.",
    action: "Send reset code",
  },

  reset: {
    title: "Reset your password",
    description:
      "Enter the code from your email and choose a new password.",
    action: "Update password",
  },

  verify: {
    title: "Verify your email",
    description: "Enter the 6-digit code sent to your email.",
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
      placeholder: "Enter your password",
    },
  ],

  member: [
    {
      name: "fullName",
      label: "Full name",
      type: "text",
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
      placeholder: "At least 6 characters",
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
      type: "text",
      inputMode: "numeric",
      placeholder: "123456",
    },
    {
      name: "password",
      label: "New password",
      type: "password",
      autoComplete: "new-password",
      placeholder: "At least 8 characters",
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
      type: "text",
      inputMode: "numeric",
      placeholder: "123456",
    },
  ],
};

const demoAccounts = {
  admin: {
    email: "demoAdmin@gmail.com",
    password: "password123",
    label: "Admin",
    icon: ShieldCheck,
  },

  manager: {
    email: "manager@gmail.com",
    password: "password123",
    label: "Manager",
    icon: UserCheck,
  },

  member: {
    email: "member@gmail.com",
    password: "password123",
    label: "Member",
    icon: Users2,
  },
} as const;

type DemoRole = keyof typeof demoAccounts;

export function AuthForm({
  mode,
  organizationId,
}: AuthFormProps) {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loadingRole, setLoadingRole] = useState<DemoRole | null>(null);

  const currentConfig = config[mode];

  const defaultValues: Values = Object.fromEntries(
    fields[mode].map((field) => [field.name, ""]),
  );

  if (mode === "member" && organizationId) {
    defaultValues.organizationId = organizationId;
  }

  const form = useForm<Values>({
    resolver: zodResolver(schemas[mode]) as never,
    defaultValues,
    mode: "onChange",
  });

  function redirectByRole(role?: string) {
    if (role === "ADMIN") {
      router.push("/dashboard/admin");
    } else if (role === "MANAGER") {
      router.push("/dashboard/manager");
    } else if (role === "MEMBER") {
      router.push("/dashboard/member");
    } else {
      router.push("/dashboard");
    }

    router.refresh();
  }

  async function handleLoginSubmission(
    values: {
      email: string;
      password: string;
    },
    demoRole?: DemoRole,
  ) {
    if (demoRole) {
      setLoadingRole(demoRole);
    }

    try {
      const result = await login(values);

      if (!result.success) {
        throw new Error(result.message);
      }

      const role = result.data?.user?.role;

      if (!role) {
        throw new Error("User role is undefined.");
      }

      if (demoRole) {
        toast.success(`${demoAccounts[demoRole].label} demo login successful`, {
          description: "Redirecting to the demo workspace.",
        });
      } else {
        toast.success("Welcome back", {
          description: "Your workspace is ready.",
        });
      }

      redirectByRole(role);
    } catch (error) {
      toast.error(
        demoRole ? "Demo login failed" : "Unable to sign in",
        {
          description:
            error instanceof Error
              ? error.message
              : "Please try again.",
        },
      );
    } finally {
      setLoadingRole(null);
    }
  }

  async function handleDemoLogin(role: DemoRole) {
    if (form.formState.isSubmitting || loadingRole) {
      return;
    }

    const account = demoAccounts[role];

    await handleLoginSubmission(
      {
        email: account.email,
        password: account.password,
      },
      role,
    );
  }

  async function submit(values: Values) {
    try {
      if (mode === "login") {
        await handleLoginSubmission({
          email: values.email,
          password: values.password,
        });

        return;
      }

      if (mode === "member") {
        const result = await registerMember({
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          organizationId: values.organizationId,
        });

        if (!result.success) {
          throw new Error(result.message);
        }

        toast.success("Account created", {
          description: "You can now sign in to your workspace.",
        });

        router.push("/login");
        return;
      }

      if (mode === "forgot") {
        const result = await forgotPassword(values.email);

        if (!result.success) {
          throw new Error(result.message);
        }

        toast.success("Check your email", {
          description:
            "If the account exists, a password reset code has been sent.",
        });

        router.push(
          `/reset-password?email=${encodeURIComponent(values.email)}`,
        );

        return;
      }

      if (mode === "reset") {
        const result = await resetPassword({
          email: values.email,
          otp: values.otp,
          password: values.password,
        });

        if (!result.success) {
          throw new Error(result.message);
        }

        toast.success("Password updated", {
          description: "You can now sign in with your new password.",
        });

        router.push("/login");
        return;
      }

      if (mode === "verify") {
        const result = await verifyEmail({
          email: values.email,
          otp: values.otp,
        });

        if (!result.success) {
          throw new Error(result.message);
        }

        setSuccess(true);
      }
    } catch (error) {
      toast.error("Something went wrong", {
        description:
          error instanceof Error
            ? error.message
            : "Please try again.",
      });
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md">
        <Card className="border-zinc-200 shadow-sm dark:border-zinc-800">
          <CardHeader className="space-y-2 px-6 pt-6">
            <CardTitle className="text-xl">
              Email verified
            </CardTitle>

            <CardDescription>
              Your email has been verified successfully.
              You can now sign in to your account.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            <Button asChild className="h-11 w-full">
              <Link href="/login">Continue to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const showGoogle = mode === "login" || mode === "member";

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="mb-6 text-center">
        <Link
          href="/login"
          className="mb-6 inline-flex items-center gap-2"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-sm font-semibold text-white dark:bg-white dark:text-zinc-900">
            O
          </span>

          <span className="text-lg font-semibold tracking-tight">
            Orbrin
          </span>
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
          {currentConfig.title}
        </h1>

        <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          {currentConfig.description}
        </p>
      </div>

      <Card className="border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <CardHeader className="sr-only">
          <CardTitle>{currentConfig.title}</CardTitle>

          <CardDescription>
            {currentConfig.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 sm:p-6">
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
                  render={({ field: control }) => {
                    const isPassword = field.type === "password";

                    return (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-sm font-medium">
                            {field.label}
                          </FormLabel>

                          {mode === "login" &&
                            field.name === "password" && (
                              <Link
                                href="/forgot-password"
                                className="text-xs font-medium text-zinc-500 transition hover:text-zinc-950 hover:underline dark:text-zinc-400 dark:hover:text-white"
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
                                isPassword && showPassword
                                  ? "text"
                                  : field.type
                              }
                              autoComplete={field.autoComplete}
                              placeholder={field.placeholder}
                              inputMode={field.inputMode}
                              className="h-11 rounded-lg border-zinc-200 bg-white pr-10 shadow-none transition focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:focus-visible:ring-zinc-300"
                            />

                            {isPassword && (
                              <button
                                type="button"
                                onClick={() =>
                                  setShowPassword(
                                    (value) => !value,
                                  )
                                }
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
                                aria-label={
                                  showPassword
                                    ? "Hide password"
                                    : "Show password"
                                }
                              >
                                {showPassword ? (
                                  <EyeOff className="size-4" />
                                ) : (
                                  <Eye className="size-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </FormControl>

                        <FormMessage className="text-xs" />
                      </FormItem>
                    );
                  }}
                />
              ))}

              {mode === "member" && (
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs leading-5 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                  You're joining a team through an invitation.
                  Your organization is determined by the
                  invitation link.
                </div>
              )}

              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting ||
                  !form.formState.isValid ||
                  !!loadingRole
                }
                className="h-11 w-full rounded-lg"
              >
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}

                {currentConfig.action}
              </Button>
            </form>
          </Form>

          {/* Demo accounts */}
          {mode === "login" && (
            <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-950/50">
              <div className="mb-3">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Quick Demo Accounts
                </p>

                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  Sign in instantly with a demo role.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(
                  Object.entries(demoAccounts) as [
                    DemoRole,
                    (typeof demoAccounts)[DemoRole],
                  ][]
                ).map(([role, account]) => {
                  const Icon = account.icon;
                  const isLoading = loadingRole === role;

                  return (
                    <Button
                      key={role}
                      type="button"
                      variant="outline"
                      disabled={
                        !!loadingRole ||
                        form.formState.isSubmitting
                      }
                      onClick={() => handleDemoLogin(role)}
                      className="h-auto min-h-16 flex-col gap-1.5 rounded-lg px-2 py-2.5"
                    >
                      {isLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Icon className="size-4" />
                      )}

                      <span className="text-xs">
                        {account.label}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Google */}
          {showGoogle && (
            <>
              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />

                <span className="text-xs font-medium text-zinc-400">
                  OR
                </span>

                <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
              </div>

              <GoogleLoginButton
                organizationId={
                  mode === "member"
                    ? organizationId
                    : undefined
                }
              />
            </>
          )}

          {/* Navigation */}
          <div className="mt-6 text-center">
            {mode === "login" && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                New to Orbrin?{" "}
                <Link
                  href="/register-owner"
                  className="font-medium text-zinc-950 hover:underline dark:text-white"
                >
                  Create a workspace
                </Link>
              </p>
            )}

            {mode === "member" && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-zinc-950 hover:underline dark:text-white"
                >
                  Sign in
                </Link>
              </p>
            )}

            {mode === "forgot" && (
              <Link
                href="/login"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-950 hover:underline dark:text-zinc-400 dark:hover:text-white"
              >
                Back to sign in
              </Link>
            )}

            {mode === "reset" && (
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-950 hover:underline dark:text-zinc-400 dark:hover:text-white"
              >
                Didn't receive a code? Send again
              </Link>
            )}

            {mode === "verify" && (
              <button
                type="button"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-950 hover:underline dark:text-zinc-400 dark:hover:text-white"
                onClick={async () => {
                  const email = form.getValues("email");

                  if (!email) {
                    toast.error("Enter your email first.");
                    return;
                  }

                  try {
                    const result =
                      await sendVerificationEmail(email);

                    if (!result.success) {
                      throw new Error(result.message);
                    }

                    toast.success("Verification code sent");
                  } catch (error) {
                    toast.error("Unable to resend code", {
                      description:
                        error instanceof Error
                          ? error.message
                          : "Please try again.",
                    });
                  }
                }}
              >
                Resend verification code
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="mt-5 px-4 text-center text-xs leading-5 text-zinc-400 dark:text-zinc-500">
        By continuing, you agree to Orbrin's Terms and
        Privacy Policy.
      </p>
    </div>
  );
}