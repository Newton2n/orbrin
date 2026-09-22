"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { logout } from "@/actions/auth.action"; // Your server action
import { toast } from "sonner"; // Or your preferred toast library

interface LogoutButtonProps {
  variant?: "ghost" | "default" | "outline" | "secondary";
  className?: string;
}

export function LogoutButton({ variant = "ghost", className }: LogoutButtonProps) {
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