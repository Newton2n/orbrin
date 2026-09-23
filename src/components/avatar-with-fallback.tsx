import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/utils/utils";

export function AvatarWithFallback({ name, imageUrl, size = "default", className }: { name?: string | null; imageUrl?: string | null; size?: "sm" | "default" | "lg"; className?: string }) {
  const label = name?.trim() || "User";
  const initials = label.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "U";
  return <Avatar size={size} className={cn(className)}><AvatarImage src={imageUrl ?? undefined} alt={`${label} avatar`} /><AvatarFallback>{initials}</AvatarFallback></Avatar>;
}
