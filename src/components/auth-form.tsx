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
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
    {
      name: "password",
      label: "Password",
      type: "password",
      autoComplete: "current-password",
    },
  ],
  register: [
    { name: "fullName", label: "Full name", autoComplete: "name" },
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
    {
      name: "password",
      label: "Password",
      type: "password",
      autoComplete: "new-password",
    },
    { name: "organizationName", label: "Organization name" },
    {
      name: "organizationSlug",
      label: "Organization slug",
      placeholder: "acme-team",
    },
  ],
  member: [
    { name: "fullName", label: "Full name", autoComplete: "name" },
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
    {
      name: "password",
      label: "Password",
      type: "password",
      autoComplete: "new-password",
    },
    { name: "organizationId", label: "Organization ID" },
  ],
  forgot: [
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
  ],
  reset: [
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
    { name: "otp", label: "Verification code", inputMode: "numeric" },
    {
      name: "password",
      label: "New password",
      type: "password",
      autoComplete: "new-password",
    },
  ],
  verify: [
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
    { name: "otp", label: "Verification code", inputMode: "numeric" },
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
        mode === "verify"
          ? "Email verified"
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
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "verify" ? "Email verified" : "Check your inbox"}
          </CardTitle>
          <CardDescription>
            Your request was accepted by the server. Follow the next steps in
            your email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href={mode === "verify" ? "/login" : "/login"}>
              {mode === "verify" ? "Continue to sign in" : "Return to sign in"}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );

  return (
    <Card className="border-border/70 shadow-xl shadow-slate-900/5">
      <CardHeader className="space-y-3 p-7">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            O
          </span>{" "}
          ORBRIN
        </Link>
        <div className="pt-5">
          <CardTitle className="text-2xl">{config.title}</CardTitle>
          <CardDescription className="mt-2">
            {config.description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-7 pb-7">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(submit)}
            className="flex flex-col gap-4"
          >
            {fields[mode].map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={({ field: control }) => (
                  <FormItem>
                    <FormLabel>{field.label}</FormLabel>
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
                          inputMode={field.inputMode as "numeric" | undefined}
                        />
                        {field.type === "password" && (
                          <button
                            type="button"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            onClick={() => setShowPassword((value) => !value)}
                          >
                            {showPassword ? <EyeOff /> : <Eye />}
                          </button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button
              type="submit"
              className="mt-2 w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && (
                <Loader2 className="animate-spin" data-icon="inline-start" />
              )}
              {config.action}
            </Button>
          </form>
        </Form>
        {mode === "login" && (
          <Link
            href="/forgot-password"
            className="mt-5 block text-center text-sm text-primary hover:underline"
          >
            Forgot your password?
          </Link>
        )}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              New to Orbrin?{" "}
              <Link
                className="font-medium text-primary hover:underline"
                href="/register"
              >
                Create a workspace
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link
                className="font-medium text-primary hover:underline"
                href="/login"
              >
                Sign in
              </Link>
            </>
          )}
        </p>
        {mode === "verify" && (
          <button
            type="button"
            className="mt-3 w-full text-center text-sm text-muted-foreground hover:text-foreground"
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
        )}
      </CardContent>
    </Card>
  );
}

export default AuthForm;