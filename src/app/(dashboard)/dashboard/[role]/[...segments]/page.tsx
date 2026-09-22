import { WorkspaceView } from "../../../../../components/workspace-view";

export default async function WorkspaceRoute({ params }: { params: Promise<{ role: string; segments: string[] }> }) {
  const { segments } = await params;
  return <WorkspaceView section={segments} />;
}
