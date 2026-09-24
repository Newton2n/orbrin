"use client";

import { useSearchParams } from "next/navigation";

import { AuthForm } from "../../../components/auth-form";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <AuthForm
      mode="reset"
      defaultEmail={email ?? undefined}
    />
  );
}