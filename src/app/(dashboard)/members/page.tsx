"use client";

import {
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Mail,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

const membersData = [
  {
    id: "1",
    name: "Newton Williams",
    email: "newton@example.com",
    role: "ADMIN",
    status: "ACTIVE",
    teams: 3,
    joinedDate: "2024-01-15",
    initials: "NW",
  },
  {
    id: "2",
    name: "Sarah Chen",
    email: "sarah@example.com",
    role: "MANAGER",
    status: "ACTIVE",
    teams: 2,
    joinedDate: "2024-02-20",
    initials: "SC",
  },
  {
    id: "3",
    name: "Alex Morgan",
    email: "alex@example.com",
    role: "MEMBER",
    status: "ACTIVE",
    teams: 1,
    joinedDate: "2024-03-10",
    initials: "AM",
  },
  {
    id: "4",
    name: "Priya Shah",
    email: "priya@example.com",
    role: "MEMBER",
    status: "PENDING",
    teams: 0,
    joinedDate: "2024-09-15",
    initials: "PS",
  },
  {
    id: "5",
    name: "David Lee",
    email: "david@example.com",
    role: "MANAGER",
    status: "ACTIVE",
    teams: 2,
    joinedDate: "2024-04-05",
    initials: "DL",
  },
];

export default function MembersPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");

  const filtered = membersData.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(search.toLowerCase());
    const matchesRole = role === "all" || member.role === role;
    const matchesStatus = status === "all" || member.status === status;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Organization</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
            Members
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your organization members and their roles.
          </p>
        </div>
        <Button>
          <Plus /> Invite Member
        </Button>
      </div>

      <Card className="border-border/70 shadow-none">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members..."
              />
            </div>
            <Select value={role} onValueChange={(value) => setRole(value ?? "all")}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
                <SelectItem value="MEMBER">Member</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(value) => setStatus(value ?? "all")}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Teams</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{member.initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{member.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          member.status === "ACTIVE" ? "secondary" : "outline"
                        }
                      >
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {member.teams}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(member.joinedDate).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="mr-2 size-4" /> Change Role
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 size-4" /> Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center">
                    <p className="text-sm text-muted-foreground">
                      No members found
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </section>
  );
}
