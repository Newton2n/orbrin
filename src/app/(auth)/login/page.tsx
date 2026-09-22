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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { login } from "../../../actions/auth.action";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";
import { loginSchema } from "../../../features/auth/schemas/auth.schema";

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  async function handleLoginSubmission(values: LoginValues, roleName?: string) {
    try {
      if (roleName) setLoadingRole(roleName);
      const result = await login(values);

      if (!result.success) throw new Error(result.message);

      toast.success("Welcome back", {
        description: "Your workspace is ready.",
      });

      if (!result.data?.user?.role) throw new Error("User role is undefined");

      const userRole = result?.data?.user.role;

      if (userRole === "ADMIN") {
        router.push("/dashboard/admin");
      } else if (userRole === "MANAGER") {
        router.push("/dashboard/manager");
      } else if (userRole === "MEMBER") {
        router.push("/dashboard/member");
      } else {
        router.push("/");
      }
    } catch (error) {
      toast.error("Unable to sign in", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setLoadingRole(null);
    }
  }

  // Quick Demo Auto-fill Helper
  const fillDemoAccount = (role: "admin" | "manager" | "member") => {
    const mockCredentials = {
      admin: { email: "demoAdmin@gmail.com", password: "password123" },
      manager: { email: "manager@gmail.com", password: "password123" },
      member: { email: "member@gmail.com", password: "password123" },
    };

    const creds = mockCredentials[role];
    form.setValue("email", creds.email, { shouldValidate: true });
    form.setValue("password", creds.password, { shouldValidate: true });
    handleLoginSubmission(creds, role);
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      {/* Brand + title */}
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
            Orbrin
          </p>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          Welcome back
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
          Sign in to continue to your workspace.
        </p>
      </div>

      {/* Demo Account Quick Logins */}
      <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 text-center mb-2.5">
          Quick Demo Accounts
        </p>
        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loadingRole !== null}
            onClick={() => fillDemoAccount("admin")}
            className="text-xs h-9 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {loadingRole === "admin" ? (
              <Loader2 className="size-3 animate-spin mr-1" />
            ) : (
              <ShieldCheck className="size-3 mr-1 text-emerald-500" />
            )}
            Admin
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loadingRole !== null}
            onClick={() => fillDemoAccount("manager")}
            className="text-xs h-9 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {loadingRole === "manager" ? (
              <Loader2 className="size-3 animate-spin mr-1" />
            ) : (
              <UserCheck className="size-3 mr-1 text-blue-500" />
            )}
            Manager
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loadingRole !== null}
            onClick={() => fillDemoAccount("member")}
            className="text-xs h-9 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {loadingRole === "member" ? (
              <Loader2 className="size-3 animate-spin mr-1" />
            ) : (
              <Users2 className="size-3 mr-1 text-purple-500" />
            )}
            Member
          </Button>
        </div>
      </div>

      {/* Card */}
      <Card className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <CardHeader className="px-5 pt-5 sm:px-6 sm:pt-6">
          <CardTitle className="sr-only">Login</CardTitle>
          <CardDescription className="sr-only">
            Enter your email and password to sign in.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((vals) =>
                handleLoginSubmission(vals),
              )}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium tracking-wide text-zinc-700 dark:text-zinc-300">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="you@company.com"
                        className="h-11 rounded-md border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-0 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-xs font-medium tracking-wide text-zinc-700 dark:text-zinc-300">
                        Password
                      </FormLabel>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-zinc-500 underline-offset-4 transition hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="••••••••"
                          className="h-11 rounded-md border border-zinc-200 bg-white pr-10 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-0 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-500 transition hover:text-zinc-800 focus:outline-none focus:ring-0 dark:text-zinc-400 dark:hover:text-zinc-200"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <Button
                className="mt-1 h-11 w-full rounded-md bg-zinc-900 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                type="submit"
                disabled={
                  form.formState.isSubmitting ||
                  !form.formState.isValid ||
                  loadingRole !== null
                }
              >
                {form.formState.isSubmitting && !loadingRole && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Sign in
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              New to Orbrin?{" "}
              <Link
                className="font-medium text-zinc-900 underline-offset-4 transition hover:underline dark:text-zinc-100"
                href="/register-owner"
              >
                Create a workspace
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer note */}
      <p className="mx-auto max-w-xs text-center text-xs text-zinc-400 dark:text-zinc-500">
        By signing in, you agree to our Terms and Privacy Policy.
      </p>
    </div>
  );
}
