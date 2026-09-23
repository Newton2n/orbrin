"use client";

import { Eye, MoreHorizontal, Pencil, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getOrganizationMembers,
  type OrganizationMember,
  type OrganizationMemberListParams,
  type OrganizationMembershipStatus,
  type OrganizationRole,
} from "@/actions/organization.action";
import { AvatarWithFallback } from "@/components/avatar-with-fallback";
import { ErrorState } from "@/components/shared/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MemberDetailsDialog } from "./member-details-dialog";
import { MemberRoleDialog } from "./member-role-dialog";
import { MemberStatusDialog } from "./member-status-dialog";
import { RemoveMemberDialog } from "./remove-member-dialog";

type SortValue =
  | "createdAt-desc"
  | "createdAt-asc"
  | "updatedAt-desc"
  | "role-asc";
export function OrganizationMembersTable({
  currentUserRole,
  currentUserMemberId,
  canManageMembers,
  canRemoveMembers,
}: {
  currentUserRole: OrganizationRole;
  currentUserMemberId?: string;
  canManageMembers: boolean;
  canRemoveMembers: boolean;
}) {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [params, setParams] = useState<OrganizationMemberListParams>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState<SortValue>("createdAt-desc");
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [roleMember, setRoleMember] = useState<OrganizationMember | null>(null);
  const [statusMember, setStatusMember] = useState<OrganizationMember | null>(
    null,
  );
  const [removeMember, setRemoveMember] = useState<OrganizationMember | null>(
    null,
  );
  async function load() {
    setLoading(true);
    const result = await getOrganizationMembers(params);
    setLoading(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    setError(null);
    setMembers(result.data.items);
    setTotalPages(result.data.totalPages);
  }
  // Reload when the committed query changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: load reads the current query object
  useEffect(() => {
    void load();
  }, [params]);
  function applyFilters() {
    const [sortBy, sortOrder] = sort.split("-") as [
      "createdAt" | "updatedAt" | "role",
      "asc" | "desc",
    ];
    setParams({
      page: 1,
      limit: 10,
      search: search.trim() || undefined,
      role: role === "ALL" ? undefined : (role as OrganizationRole),
      status:
        status === "ALL" ? undefined : (status as OrganizationMembershipStatus),
      sortBy,
      sortOrder,
    });
  }
  function refresh() {
    void load();
  }
  const mayEdit = (member: OrganizationMember) =>
    canManageMembers &&
    member.role !== "ADMIN" &&
    member.id !== currentUserMemberId;
  return (
    <>
      <Card className="border-border/70 shadow-none">
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by name or email"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") applyFilters();
                }}
              />
            </div>
            <Select
              value={role}
              onValueChange={(value) => {
                setRole(value ?? "ALL");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
                <SelectItem value="MEMBER">Member</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value ?? "ALL")}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sort}
              onValueChange={(value) =>
                setSort((value ?? "createdAt-desc") as SortValue)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest</SelectItem>
                <SelectItem value="createdAt-asc">Oldest</SelectItem>
                <SelectItem value="updatedAt-desc">Recently updated</SelectItem>
                <SelectItem value="role-asc">Role</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={applyFilters}>
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border/70 shadow-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Membership</TableHead>
                <TableHead>User status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Loading members...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-4">
                    <ErrorState
                      compact
                      description={error}
                      onRetry={() => void load()}
                    />
                  </TableCell>
                </TableRow>
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No members match these filters.
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => {
                  const user = member.user;
                  const editable = mayEdit(member);
                  return (
                    <TableRow
                      key={member.id}
                      className="cursor-pointer"
                      onClick={() => setDetailsId(member.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <AvatarWithFallback
                            name={user?.fullName}
                            imageUrl={user?.profileImageUrl}
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {user?.fullName || "Unknown member"}
                            </p>
                            <p className="truncate text-muted-foreground">
                              {user?.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{member.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{member.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {user?.status ?? "Unknown"}
                        {user?.emailVerified ? (
                          <span className="ml-2 text-emerald-600">
                            Verified
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        {member.createdAt
                          ? new Date(member.createdAt).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="View member"
                            onClick={(event) => {
                              event.stopPropagation();
                              setDetailsId(member.id);
                            }}
                          >
                            <Eye />
                            <span className="sr-only">View member</span>
                          </Button>
                          {editable && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Change role"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setRoleMember(member);
                                }}
                              >
                                <Pencil />
                                <span className="sr-only">Change role</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Change status"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setStatusMember(member);
                                }}
                              >
                                <MoreHorizontal />
                                <span className="sr-only">Change status</span>
                              </Button>
                            </>
                          )}
                          {canRemoveMembers &&
                            member.role !== "ADMIN" &&
                            member.id !== currentUserMemberId && (
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Remove member"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setRemoveMember(member);
                                }}
                              >
                                <Trash2 />
                                <span className="sr-only">Remove member</span>
                              </Button>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
            <span>
              Page {params.page ?? 1} of {Math.max(totalPages, 1)}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={loading || (params.page ?? 1) <= 1}
                onClick={() =>
                  setParams((value) => ({
                    ...value,
                    page: (value.page ?? 1) - 1,
                  }))
                }
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={loading || (params.page ?? 1) >= totalPages}
                onClick={() =>
                  setParams((value) => ({
                    ...value,
                    page: (value.page ?? 1) + 1,
                  }))
                }
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <MemberDetailsDialog
        open={Boolean(detailsId)}
        onOpenChange={(open) => !open && setDetailsId(null)}
        memberId={detailsId}
        currentUserRole={currentUserRole}
        canManageMembers={canManageMembers}
        canRemoveMembers={canRemoveMembers}
        onMemberChanged={refresh}
      />
      <MemberRoleDialog
        open={Boolean(roleMember)}
        onOpenChange={(open) => !open && setRoleMember(null)}
        member={roleMember}
        onUpdated={refresh}
      />
      <MemberStatusDialog
        open={Boolean(statusMember)}
        onOpenChange={(open) => !open && setStatusMember(null)}
        member={statusMember}
        onUpdated={refresh}
      />
      <RemoveMemberDialog
        open={Boolean(removeMember)}
        onOpenChange={(open) => !open && setRemoveMember(null)}
        member={removeMember}
        onRemoved={refresh}
      />
    </>
  );
}
