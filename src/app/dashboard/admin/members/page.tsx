import { ArrowUpRight, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const members = [
  {
    name: "Alex Morgan",
    email: "alex@orbrin.io",
    role: "ADMIN",
    status: "ACTIVE",
    team: "Engineering",
  },
  {
    name: "Priya Shah",
    email: "priya@orbrin.io",
    role: "MANAGER",
    status: "ACTIVE",
    team: "Product",
  },
  {
    name: "Sam Hall",
    email: "sam@orbrin.io",
    role: "MANAGER",
    status: "ACTIVE",
    team: "QA",
  },
  {
    name: "Nina Park",
    email: "nina@orbrin.io",
    role: "MEMBER",
    status: "ACTIVE",
    team: "Design",
  },
];

export default function AdminMembersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            People
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.04em]">
            Members
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage access, roles, and team membership across the organization.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/admin/members/invite">Invite member</Link>
        </Button>
      </div>

      <Card className="border-border/70 shadow-none">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search members" />
            </div>
            <Button variant="outline">All roles</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-none">
        <CardHeader className="flex-row items-center justify-between gap-4">
          <CardTitle>Organization members</CardTitle>
          <Link
            href="#"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View directory <ArrowUpRight className="size-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b text-left text-xs text-muted-foreground">
              <tr>
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Team</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {members.map((member) => (
                <tr key={member.email} className="align-middle">
                  <td className="py-4">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </td>
                  <td className="py-4">
                    <Badge
                      variant={
                        member.role === "ADMIN"
                          ? "default"
                          : member.role === "MANAGER"
                            ? "outline"
                            : "secondary"
                      }
                    >
                      {member.role}
                    </Badge>
                  </td>
                  <td className="py-4 text-muted-foreground">{member.team}</td>
                  <td className="py-4">
                    <div className="inline-flex items-center gap-2">
                      <ShieldCheck className="size-3.5 text-emerald-600" />
                      <span className="text-muted-foreground">
                        {member.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
