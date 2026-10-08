"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { logout } from "../actions/auth.action";
import { Button } from "./ui/button";

interface LogoutButtonProps {
  variant?: "ghost" | "default" | "outline" | "secondary";
  className?: string;
}

export function LogoutButton({
  variant = "ghost",
  className,
}: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    toast.success("Logged out successfully");

    startTransition(async () => {
      await logout();
    });
  };

  return (
    <Button
      variant={variant}
      onClick={handleLogout}
      disabled={isPending}
      className={className}
    >
      <LogOut className="mr-2 size-4" />
      {isPending ? "Logging out..." : "Logout"}
    </Button>
  );
}
