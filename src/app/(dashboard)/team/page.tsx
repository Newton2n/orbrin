import { UserPlus, Users } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

export default function TeamPage() {
  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Workspace directory
          </p>
          <h1 className="mt-3 font-heading text-4xl font-semibold tracking-[-0.04em]">
            Team
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Manage ownership, roles, and the people building together.
          </p>
        </div>
        <Button>
          <UserPlus data-icon="inline-start" /> Invite member
        </Button>
      </div>
      <Card className="border-border/70 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-4 text-primary" /> Your organization
          </CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-48 flex-col items-center justify-center rounded-b-lg bg-muted/30 text-center">
          <p className="font-medium">Connect your organization directory</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Members, roles, and status will appear here once the workspace API
            is connected.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
