
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { registerOwner } from "../../../actions/auth.action";
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
import { registerOwnerSchema } from "../../../features/auth/schemas/auth.schema";

type OwnerValues = z.infer<typeof registerOwnerSchema>;

function generateSuffix() {
  return Math.random()
    .toString(36)
    .slice(2, 6);
}

function generateSlug(name: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug
    ? `${slug}-${generateSuffix()}`
    : generateSuffix();
}

export default function RegisterOwnerPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] =
    useState(false);

  const [slugTouched, setSlugTouched] =
    useState(false);

  const lastGeneratedName = useRef("");

  const form = useForm<OwnerValues>({
    resolver: zodResolver(registerOwnerSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      organizationName: "",
      organizationSlug: "",
    },
  });

  const organizationName = form.watch(
    "organizationName",
  );

  const organizationSlug = form.watch(
    "organizationSlug",
  );

  useEffect(() => {
    if (slugTouched) return;

    const name = organizationName.trim();

    if (!name) {
      if (organizationSlug) {
        form.setValue("organizationSlug", "");
      }

      lastGeneratedName.current = "";

      return;
    }

    if (name === lastGeneratedName.current) {
      return;
    }

    const slug = generateSlug(name);

    lastGeneratedName.current = name;

    form.setValue("organizationSlug", slug, {
      shouldValidate: true,
      shouldDirty: false,
    });
  }, [
    organizationName,
    organizationSlug,
    slugTouched,
    form,
  ]);

  async function submit(values: OwnerValues) {
    try {
      const result = await registerOwner(values);

      if (!result.success) {
        throw new Error(result.message);
      }

      toast.success("Workspace created", {
        description:
          "Your workspace is ready. You can now sign in.",
      });

      router.push("/login");
    } catch (error) {
      toast.error("Unable to create workspace", {
        description:
          error instanceof Error
            ? error.message
            : "Please try again.",
      });
    }
  }

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

          <span className="text-lg font-semibold">
            Orbrin
          </span>
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Create your workspace
        </h1>

        <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          Set up your organization and become its owner.
        </p>
      </div>

      <Card className="border-zinc-200 shadow-sm dark:border-zinc-800">
        <CardHeader className="sr-only">
          <CardTitle>Create workspace</CardTitle>

          <CardDescription>
            Create your Orbrin workspace.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 sm:p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(submit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>

                    <FormControl>
                      <Input
                        {...field}
                        autoComplete="name"
                        placeholder="John Doe"
                        className="h-11 rounded-lg"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>

                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        autoComplete="email"
                        placeholder="you@company.com"
                        className="h-11 rounded-lg"
                      />
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
                      <div className="relative">
                        <Input
                          {...field}
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          autoComplete="new-password"
                          placeholder="At least 6 characters"
                          className="h-11 rounded-lg pr-10"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(
                              (value) => !value,
                            )
                          }
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
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
                      </div>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Workspace
                </p>

                <FormField
                  control={form.control}
                  name="organizationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Organization name
                      </FormLabel>

                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Acme Inc."
                          className="h-11 rounded-lg"
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="organizationSlug"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>
                        Workspace URL
                      </FormLabel>

                      <FormControl>
                        <Input
                          {...field}
                          placeholder="acme-inc"
                          onBlur={() => {
                            setSlugTouched(true);
                            field.onBlur();
                          }}
                          className="h-11 rounded-lg"
                        />
                      </FormControl>

                      <p className="text-xs text-zinc-400">
                        Used to identify your workspace.
                      </p>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting ||
                  !form.formState.isValid
                }
                className="h-11 w-full rounded-lg"
              >
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}

                Create workspace
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-zinc-950 hover:underline dark:text-white"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

