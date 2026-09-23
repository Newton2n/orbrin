"use client";

import { useState } from "react";

import type { Project } from "@/actions/project.action";

import { Button } from "@/components/ui/button";

import { ProjectTeamsDialog } from "./project-teams-dialog";

export function ProjectDetailControls({
  project,
  role = "ADMIN",
  canManageTeams = false,
}: {
  project: Project;
  role?: "ADMIN" | "MANAGER" | "MEMBER";
  canManageTeams?: boolean;
}) {
  const [teamsOpen, setTeamsOpen] =
    useState(false);

  if (!canManageTeams) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setTeamsOpen(true)}
      >
        Manage teams
      </Button>

      <ProjectTeamsDialog
        open={teamsOpen}
        onOpenChange={setTeamsOpen}
        project={project}
        role={role}
        canManageTeams={canManageTeams}
      />
    </>
  );
}