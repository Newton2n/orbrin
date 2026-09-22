"use client";

import { useState } from "react";
import type { Project } from "@/actions/project.action";
import { Button } from "@/components/ui/button";
import { ProjectTeamsDialog } from "./project-teams-dialog";

export function ProjectDetailControls({
  project,
  canManageTeams = false,
}: {
  project: Project;
  canManageTeams?: boolean;
}) {
  const [teamsOpen, setTeamsOpen] = useState(false);
  return (
    <>
      {canManageTeams && (
        <Button variant="outline" onClick={() => setTeamsOpen(true)}>
          Manage teams
        </Button>
      )}
      <ProjectTeamsDialog
        open={teamsOpen}
        onOpenChange={setTeamsOpen}
        projectId={project.id}
        canManageTeams={canManageTeams}
      />
    </>
  );
}
