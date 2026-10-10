import { getCurrentUser } from "@/actions/auth.action";
import { PublicLayoutClient } from "@/components/public-site";
import type { AuthUser } from "@/features/auth/types/auth.types";

export async function PublicLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: AuthUser | null;
}) {
  const result = user === undefined ? await getCurrentUser() : null;
  const currentUser = user === undefined
    ? result?.success
      ? result.data
      : null
    : user;

  return (
    <PublicLayoutClient user={currentUser}>
      {children}
    </PublicLayoutClient>
  );
}
