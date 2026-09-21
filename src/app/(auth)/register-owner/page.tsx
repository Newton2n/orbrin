"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { registerOwner } from "@/features/auth/api/auth.api";
import { registerOwnerSchema } from "@/features/auth/schemas/auth.schema";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const ownerSchema = z.object({
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
type OwnerValues = z.infer<typeof ownerSchema>;

export default function RegisterOwnerPage() {
  const router = useRouter();
  const form = useForm<OwnerValues>({
    resolver: zodResolver(ownerSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      organizationName: "",
      organizationSlug: "",
    },
  });

  async function onSubmit(values: OwnerValues) {
    try {
      await registerOwner(registerOwnerSchema.parse(values));
      toast.success("Workspace created", {
        description: "You can now sign in to Orbrin.",
      });
      router.push("/login");
    } catch (error) {
      toast.error("Registration failed", {
        description:
          error instanceof ApiError ? error.message : "Please try again.",
      });
    }
  }

  return (
    <Card className="border-border/70 shadow-xl shadow-slate-900/5">
      <CardHeader className="space-y-3 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Orbrin
        </p>
        <CardTitle className="text-2xl">Create your workspace</CardTitle>
        <CardDescription>
          Set up the organization where your team will do its best work.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-7 pb-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {(
              [
                "fullName",
                "email",
                "password",
                "organizationName",
                "organizationSlug",
              ] as const
            ).map((name) => (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {name === "fullName"
                        ? "Full name"
                        : name === "organizationName"
                          ? "Organization name"
                          : name === "organizationSlug"
                            ? "Organization slug"
                            : name[0].toUpperCase() + name.slice(1)}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type={
                          name === "password"
                            ? "password"
                            : name === "email"
                              ? "email"
                              : "text"
                        }
                        placeholder={
                          name === "organizationSlug"
                            ? "acme-studio"
                            : undefined
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button
              className="mt-2 h-10 w-full"
              type="submit"
              disabled={form.formState.isSubmitting || !form.formState.isValid}
            >
              {form.formState.isSubmitting && (
                <Loader2 className="animate-spin" />
              )}{" "}
              Create workspace
            </Button>
          </form>
        </Form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have a workspace?{" "}
          <Link
            className="font-medium text-primary hover:underline"
            href="/login"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
