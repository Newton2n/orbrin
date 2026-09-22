"use client";

import { useRouter } from "next/navigation";
import { AuthForm } from "../../../components/auth-form";

export default function ForgotPasswordPage() {
  const router = useRouter();

  return (
    <AuthForm
      mode="forgot"
      onSuccess={() => {
        router.push("/reset-password");
      }}
    />
  );
}