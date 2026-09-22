"use client";

import { ChevronDown, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

import { logout } from "@/actions/auth.action";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { AuthUser, Role } from "@/features/auth/types/auth.types";
import { UserInitials, UserRoleLabel } from "./shared/dashboard-content";

export function UserMenu({ user, role }: { user: AuthUser; role: Role }) {
  const router = useRouter();

  const label = user.fullName || user.email || "Account";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-9 items-center gap-2 rounded-md px-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-900"
        aria-label="Open account menu"
      >
        <Avatar className="size-8">
          <AvatarFallback className="bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
            <UserInitials user={user} />
          </AvatarFallback>
        </Avatar>

        <span className="hidden max-w-32 truncate sm:inline">{label}</span>

        <ChevronDown
          className="size-3.5 text-zinc-500 dark:text-zinc-400"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* User information */}
        <div className="px-2 py-1.5">
          <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {label}
          </p>

          <UserRoleLabel role={role} />

          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            {user.email}
          </p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() =>
            router.push(`/dashboard/${role.toLowerCase()}/settings`)
          }
        >
          <Settings />
          Profile & settings
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            void logout();
          }}
          className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
        >
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
