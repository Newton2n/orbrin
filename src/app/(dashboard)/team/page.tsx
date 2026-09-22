"use client";

import {
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Edit,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

const teamsData = [
  {
    id: "1",
    name: "Product",
    description: "Product strategy and roadmap",
    members: 6,
    projects: 4,
    tasks: 24,
    avatars: ["NW", "SC", "AM"],
  },
  {
    id: "2",
    name: "Engineering",
    description: "Platform architecture and development",
    members: 12,
    projects: 5,
    tasks: 67,
    avatars: ["PS", "DL", "MK"],
  },
  {
    id: "3",
    name: "Design",
    description: "UI/UX design and research",
    members: 4,
    projects: 3,
    tasks: 12,
    avatars: ["SJ", "RL"],
  },
  {
    id: "4",
    name: "Growth",
    description: "Marketing and user acquisition",
    members: 5,
    projects: 2,
    tasks: 18,
    avatars: ["TG", "NK"],
  },
];

export default function TeamsPage() {
  const [search, setSearch] = useState("");

  const filtered = teamsData.filter((team) =>
    team.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Organization workspace</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
            Teams
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Organize your people and manage team-based work.
          </p>
        </div>
        <Button>
          <Plus /> Create Team
        </Button>
      </div>

      <Card className="border-border/70 shadow-none">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teams..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {filtered.length > 0 ? (
          filtered.map((team) => (
            <Card
              key={team.id}
              className="border-border/70 shadow-none hover:bg-muted/30 transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base">{team.name}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {team.description}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 size-4" /> Edit Team
                      </DropdownMenuItem>
                      <DropdownMenuItem>View Members</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 size-4" /> Delete Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-1">
                  {team.avatars.map((avatar) => (
                    <Avatar key={avatar} className="size-7">
                      <AvatarFallback className="text-xs">
                        {avatar}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {team.members > team.avatars.length && (
                    <Avatar className="size-7 bg-muted">
                      <AvatarFallback className="text-xs">
                        +{team.members - team.avatars.length}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 border-t border-border/70 pt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Members</p>
                    <p className="mt-1 text-sm font-medium">{team.members}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Projects</p>
                    <p className="mt-1 text-sm font-medium">{team.projects}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tasks</p>
                    <p className="mt-1 text-sm font-medium">{team.tasks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full border-border/70 shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="grid size-12 place-items-center rounded-full bg-muted">
                <Users className="size-5 text-muted-foreground" />
              </div>
              <h3 className="mt-4 font-semibold">No teams found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your first team to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
