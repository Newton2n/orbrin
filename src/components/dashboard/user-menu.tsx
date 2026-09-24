"use client";

import { ChevronDown, LogOut, Settings } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { logout } from "@/actions/auth.action";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type {
  AuthUser,
  Role,
} from "@/features/auth/types/auth.types";

import {
  UserInitials,
  UserRoleLabel,
} from "./shared/dashboard-content";

export function UserMenu({
  user,
  role,
}: {
  user: AuthUser;
  role: Role;
}) {
  const router = useRouter();

  const label = user.fullName || user.email || "Account";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-10 items-center gap-2 rounded-md px-2 text-sm font-medium text-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Open account menu"
      >
        <Avatar className="size-8">
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

        <span className="hidden max-w-32 truncate sm:inline">
          {label}
        </span>

        <ChevronDown
          className="size-3.5 text-muted-foreground"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64"
      >
        {/* User information */}
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
              <p className="truncate text-sm font-medium">
                {label}
              </p>

              <UserRoleLabel role={role} />

              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() =>
            router.push(
              `/dashboard/${role.toLowerCase()}/settings`,
            )
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