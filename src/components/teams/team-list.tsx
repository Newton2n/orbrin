"use client";

import { Eye, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  deleteTeam,
  getTeams,
  type Team,
  type TeamListParams,
} from "@/actions/team.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { TeamDetailsDialog } from "./team-details-dialog";
import { TeamFormDialog } from "./team-form-dialog";
import { TeamMembersDialog } from "./team-members-dialog";

export type Role = "ADMIN" | "MANAGER" | "MEMBER";
export type TeamListProps = {
  role: Role;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canManageMembers?: boolean;
  canViewDetails?: boolean;
};
type FormState = { mode: "create" } | { mode: "edit"; team: Team } | null;

export function TeamList({
  role,
  canCreate = false,
  canEdit = false,
  canDelete = false,
  canManageMembers = false,
  canViewDetails = false,
}: TeamListProps) {
  const [result, setResult] = useState<{
    items: Team[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<TeamListParams["sortBy"]>("createdAt");
  const [form, setForm] = useState<FormState>(null);
  const [details, setDetails] = useState<Team | null>(null);
  const [membersTeam, setMembersTeam] = useState<Team | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Team | null>(null);

  async function loadTeams() {
    setLoading(true);
    const response = await getTeams({
      page,
      limit: 10,
      search: search || undefined,
      sortBy,
      sortOrder: "desc",
    });
    if (!response.ok) setError(response.message ?? "Unable to load teams.");
    else {
      setError(undefined);
      setResult(response.data);
    }
    setLoading(false);
  }
  // biome-ignore lint/correctness/useExhaustiveDependencies: reload when list query changes
  useEffect(() => {
    void loadTeams();
  }, [page, search, sortBy]);

  async function handleDelete() {
    if (!deleteTarget) return;
    const response = await deleteTeam(deleteTarget.id);
    if (!response.ok) toast.error(response.message ?? "Unable to delete team.");
    else {
      toast.success(response.message ?? "Team deleted.");
      setDeleteTarget(null);
      void loadTeams();
    }
  }

  const actionsVisible =
    canViewDetails || canEdit || canManageMembers || canDelete;
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <Input
            className="md:max-w-sm"
            placeholder="Search teams"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          <Select
            value={sortBy}
            onValueChange={(value) =>
              setSortBy((value as TeamListParams["sortBy"]) || "createdAt")
            }
          >
            <SelectTrigger className="md:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Newest</SelectItem>
              <SelectItem value="updatedAt">Recently updated</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
          {canCreate && (
            <Button
              className="md:ml-auto"
              onClick={() => setForm({ mode: "create" })}
            >
              <Plus />
              New team
            </Button>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{role[0] + role.slice(1).toLowerCase()} teams</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <p className="py-8 text-center text-muted-foreground">
              Loading teams...
            </p>
          )}
          {error && (
            <p className="rounded-md border border-destructive/30 p-4 text-destructive">
              {error}
            </p>
          )}
          {!loading && !error && !result?.items.length && (
            <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              No teams found.
            </p>
          )}
          {!loading && !error && result?.items.length ? (
            <>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Created</TableHead>
                      {actionsVisible && (
                        <TableHead className="text-right">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.items.map((team) => (
                      <TableRow key={team.id} className="h-14">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                              <Users className="size-4" />
                            </div>
                            <div>
                              <p className="font-medium">{team.name}</p>
                              <Badge
                                variant="secondary"
                                className="mt-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                              >
                                Active
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-sm truncate text-muted-foreground">
                          {team.description || "No description"}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {team.memberCount ?? team.members?.length ?? 0}
                          </span>
                          <span className="ml-1 text-muted-foreground">
                            members
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {team.createdAt
                            ? new Date(team.createdAt).toLocaleDateString()
                            : "Unknown"}
                        </TableCell>
                        {actionsVisible && (
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              {canViewDetails && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="View team details"
                                  onClick={() => setDetails(team)}
                                >
                                  <Eye />
                                </Button>
                              )}
                              {canEdit && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Edit team"
                                  onClick={() =>
                                    setForm({ mode: "edit", team })
                                  }
                                >
                                  <Pencil />
                                </Button>
                              )}
                              {canManageMembers && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Manage members"
                                  onClick={() => setMembersTeam(team)}
                                >
                                  <Users />
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Delete team"
                                  onClick={() => setDeleteTarget(team)}
                                >
                                  <Trash2 />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between pt-4 text-xs text-muted-foreground">
                <span>
                  Page {result.page} of {result.totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={result.page <= 1}
                    onClick={() => setPage(result.page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={result.page >= result.totalPages}
                    onClick={() => setPage(result.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
      {form && (
        <TeamFormDialog
          open
          onOpenChange={(open) => !open && setForm(null)}
          {...form}
        />
      )}
      <TeamDetailsDialog
        open={Boolean(details)}
        onOpenChange={(open) => !open && setDetails(null)}
        team={details}
        canManageMembers={canManageMembers}
        canEdit={canEdit}
        canDelete={canDelete}
        onEdit={() => details && setForm({ mode: "edit", team: details })}
        onDelete={() => details && setDeleteTarget(details)}
      />
      <TeamMembersDialog
        open={Boolean(membersTeam)}
        onOpenChange={(open) => !open && setMembersTeam(null)}
        teamId={membersTeam?.id ?? ""}
        canManageMembers={canManageMembers}
      />
      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        title="Delete team"
        description={`Delete ${deleteTarget?.name ?? "this team"}? This cannot be undone.`}
      />
    </div>
  );
}
