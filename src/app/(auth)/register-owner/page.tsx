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

function generateRandomSuffix(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function generateSlugFromName(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!base) return generateRandomSuffix();

  return `${base}-${generateRandomSuffix()}`;
}

export default function RegisterOwnerPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

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

  const orgNameValue = form.watch("organizationName");
  const orgSlugValue = form.watch("organizationSlug");

  const [slugTouched, setSlugTouched] = useState(false);
  const lastNameUsedForSlug = useRef<string>("");

  useEffect(() => {
    if (slugTouched) return;

    const trimmedName = orgNameValue.trim();
    if (!trimmedName) {
      if (!orgSlugValue && lastNameUsedForSlug.current) {
        form.setValue("organizationSlug", "", {
          shouldValidate: true,
          shouldDirty: false,
        });
      }
      return;
    }

    if (trimmedName === lastNameUsedForSlug.current) return;

    const generated = generateSlugFromName(trimmedName);
    lastNameUsedForSlug.current = trimmedName;

    form.setValue("organizationSlug", generated, {
      shouldValidate: true,
      shouldDirty: false,
    });
  }, [orgNameValue, slugTouched, form, orgSlugValue]);

  async function onSubmit(values: OwnerValues) {
    try {
      const result = await registerOwner(values);
      if (!result.success) throw new Error(result.message);
      toast.success("Workspace created", {
        description: "You can now sign in to Orbrin.",
      });
      router.push("/login");
    } catch (error) {
      toast.error("Registration failed", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  const fields: {
    name: keyof OwnerValues;
    label: string;
    type?: "text" | "email" | "password";
    placeholder?: string;
  }[] = [
    { name: "fullName", label: "Full name", type: "text" },
    { name: "email", label: "Email", type: "email" },
    {
      name: "password",
      label: "Password",
      type: showPassword ? "text" : "password",
    },
    { name: "organizationName", label: "Organization name", type: "text" },
    {
      name: "organizationSlug",
      label: "Organization slug",
      type: "text",
      placeholder: "acme-studio",
    },
  ];

  return (
    <Card className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <CardHeader className="px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
              Orbrin
            </p>
          </div>

          <CardTitle className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Create your workspace
          </CardTitle>
          <CardDescription className="text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
            Set up the organization where your team will do its best work.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {fields.map((f) => {
              const isPassword = f.name === "password";
              const isSlug = f.name === "organizationSlug";

              return (
                <FormField
                  key={f.name}
                  control={form.control}
                  name={f.name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium tracking-wide text-zinc-700 dark:text-zinc-300">
                        {f.label}
                      </FormLabel>
                      <FormControl>
                        {isPassword ? (
                          <div className="relative">
                            <Input
                              type={f.type}
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
                        ) : (
                          <Input
                            type={f.type}
                            placeholder={f.placeholder}
                            className="h-11 rounded-md border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-0 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600"
                            {...field}
                            onBlur={(e) => {
                              if (isSlug) setSlugTouched(true);
                              field.onBlur();
                            }}
                          />
                        )}
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              );
            })}

            <Button
              className="mt-1 h-11 w-full rounded-md bg-zinc-900 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              type="submit"
              disabled={
                form.formState.isSubmitting || !form.formState.isValid
              }
            >
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create workspace
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Already have a workspace?{" "}
            <Link
              className="font-medium text-zinc-900 underline-offset-4 transition hover:underline dark:text-zinc-100"
              href="/login"
            >
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}