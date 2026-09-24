"use client";

import { useSearchParams } from "next/navigation";

import { AuthForm } from "../../../components/auth-form";

export default function RegisterMemberPage() {
  const searchParams = useSearchParams();

  const organizationId = searchParams.get("organizationId");

  if (!organizationId) {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-lg font-semibold">Invitation required</h1>

          <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            You need a valid team invitation to create a member account.
          </p>

          <a
            href="/login"
            className="mt-5 inline-flex text-sm font-medium underline-offset-4 hover:underline"
          >
            Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return <AuthForm mode="member" organizationId={organizationId} />;
}
