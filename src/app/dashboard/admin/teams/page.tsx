import { ArrowUpRight, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const teams = [
  {
    name: "Engineering",
    members: 14,
    projects: 5,
    load: 68,
    lead: "Alex Morgan",
  },
  { name: "Product", members: 8, projects: 4, load: 58, lead: "Priya Shah" },
  { name: "Design", members: 5, projects: 3, load: 46, lead: "Maria Quinn" },
  { name: "QA", members: 6, projects: 2, load: 52, lead: "Sam Hall" },
];

export default function AdminTeamsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Organization
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.04em]">
            Teams
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Keep ownership clear and delivery capacity balanced.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/admin/teams/new">Create team</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {teams.map((team) => (
          <Card key={team.name} className="border-border/70 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <div className="grid size-10 place-items-center rounded-md bg-muted">
                  <Users className="size-4 text-muted-foreground" />
                </div>
                <Badge variant="secondary">{team.members} members</Badge>
              </div>
              <CardTitle className="mt-4">{team.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Lead</span>
                <span className="font-medium text-foreground">{team.lead}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Projects</span>
                <span className="font-medium text-foreground">
                  {team.projects}
                </span>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Workload</span>
                  <span>{team.load}%</span>
                </div>
                <Progress value={team.load} className="mt-2 h-1.5" />
              </div>
              <Link
                href="#"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View team <ArrowUpRight className="size-3.5" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
