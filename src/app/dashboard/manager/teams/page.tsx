import { ArrowUpRight, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const teams = [
  { name: "Engineering", members: 12, activeProjects: 5, load: 72 },
  { name: "Product", members: 7, activeProjects: 3, load: 58 },
  { name: "Design", members: 4, activeProjects: 2, load: 46 },
];

export default function ManagerTeamsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Delivery
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.04em]">
            Teams
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Balance capacity and keep ownership aligned across execution teams.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/manager/teams/new">Create team</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {teams.map((team) => (
          <Card key={team.name} className="border-border/70 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="grid size-10 place-items-center rounded-md bg-muted">
                  <Users className="size-4 text-muted-foreground" />
                </div>
                <Badge variant="secondary">{team.members} members</Badge>
              </div>
              <CardTitle className="mt-4">{team.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Active projects</span>
                <span>{team.activeProjects}</span>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Load</span>
                  <span>{team.load}%</span>
                </div>
                <Progress value={team.load} className="mt-2 h-1.5" />
              </div>
              <Link
                href="#"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Manage team <ArrowUpRight className="size-3.5" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
