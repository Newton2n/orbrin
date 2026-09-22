import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AvatarWithFallback({
  name,
  imageUrl,
  size = "default",
}: {
  name?: string | null;
  imageUrl?: string | null;
  size?: "sm" | "default" | "lg";
}) {
  const label = name?.trim() || "User";
  const initials = label
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <Avatar size={size}>
      <AvatarImage src={imageUrl ?? undefined} alt="" />
      <AvatarFallback>{initials || "U"}</AvatarFallback>
    </Avatar>
  );
}
