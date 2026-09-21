"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import type { loginSchema } from "../../../features/auth/schemas/auth.schema";

const loginPageSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});
type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginPageSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    try {
      const result = await login(loginPageSchema.parse(values));
      if (!result.success) throw new Error(result.message);
      toast.success("Welcome back", {
        description: "Your workspace is ready.",
      });
      router.push("/dashboard");
    } catch (error) {
      toast.error("Unable to sign in", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  return (
    <Card className="border-border/70 shadow-xl shadow-slate-900/5">
      <CardHeader className="space-y-3 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Orbrin
        </p>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in to continue to your workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-7 pb-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="mt-2 h-10 w-full"
              type="submit"
              disabled={form.formState.isSubmitting || !form.formState.isValid}
            >
              {form.formState.isSubmitting && (
                <Loader2 className="animate-spin" />
              )}{" "}
              Sign in
            </Button>
          </form>
        </Form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to Orbrin?{" "}
          <Link
            className="font-medium text-primary hover:underline"
            href="/register-owner"
          >
            Create a workspace
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
