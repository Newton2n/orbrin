"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { googleLogin } from "../../actions/auth.action";

type GoogleLoginButtonProps = {
  organizationId?: string;
};

export function GoogleLoginButton({
  organizationId,
}: GoogleLoginButtonProps) {
  const router = useRouter();

  async function handleSuccess(credentialResponse: {
    credential?: string;
  }) {
    const idToken = credentialResponse.credential;

    if (!idToken) {
      toast.error("Google sign-in failed.", {
        description: "Google did not return an ID token.",
      });
      return;
    }

    try {
      const result = await googleLogin({
        idToken,
        ...(organizationId ? { organizationId } : {}),
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      const role = result.data?.user?.role;

      if (!role) {
        throw new Error("User role is missing.");
      }

      toast.success("Welcome back", {
        description: "You are now signed in.",
      });

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
    } catch (error) {
      toast.error("Google sign-in failed", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  return (
    <div className="flex w-full justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => {
          toast.error("Google sign-in failed", {
            description: "Please try again.",
          });
        }}
        useOneTap={false}
        width="100%"
      />
    </div>
  );
}