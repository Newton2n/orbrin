"use client";

import { ChevronDown, LayoutDashboard, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

import { logout } from "@/actions/auth.action";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { AuthUser, Role } from "@/features/auth/types/auth.types";

import { UserInitials, UserRoleLabel } from "./shared/dashboard-content";

interface UserMenuProps {
  user: AuthUser;
  role: Role;
  showDashboard?: boolean;
  variant?: "avatar" | "labeled";
}

export function UserMenu({
  user,
  role,
  showDashboard = false,
  variant = "avatar",
}: UserMenuProps) {
  const router = useRouter();

  const label = user.fullName || user.email || "Account";

  const isLabeled = variant === "labeled";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={
          isLabeled
            ? "flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-left outline-none transition-colors hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-ring dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            : "flex size-10 items-center justify-center rounded-full outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
        }
        aria-label="Open account menu"
      >
        <span
          className={
            isLabeled
              ? "flex min-w-0 items-center gap-3"
              : "contents"
          }
        >
          <Avatar className={isLabeled ? "size-9 shrink-0" : "size-8"}>
            {user.profileImageUrl && (
              <AvatarImage
                src={user.profileImageUrl}
                alt={`${label}'s profile picture`}
                className="object-cover"
              />
            )}

            <AvatarFallback className="bg-muted text-foreground">
              <UserInitials user={user} />
            </AvatarFallback>
          </Avatar>

          {isLabeled && (
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Account
              </span>

              <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                Dashboard & settings
              </span>
            </span>
          )}
        </span>

        {isLabeled && (
          <ChevronDown
            className="size-4 shrink-0 text-zinc-500 dark:text-zinc-400"
            aria-hidden="true"
          />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-2">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 shrink-0">
              {user.profileImageUrl && (
                <AvatarImage
                  src={user.profileImageUrl}
                  alt={`${label}'s profile picture`}
                  className="object-cover"
                />
              )}

              <AvatarFallback className="bg-muted text-foreground">
                <UserInitials user={user} />
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{label}</p>

              <UserRoleLabel role={role} />

              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        {showDashboard && (
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/${role.toLowerCase()}`)}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
        )}

        {role === "ADMIN" && (
          <DropdownMenuItem
            onClick={() =>
              router.push(`/dashboard/${role.toLowerCase()}/organization`)
            }
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Organization Settings</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={() => router.push(`/dashboard/profile`)}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Profile & settings</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            void logout();
          }}
          className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}