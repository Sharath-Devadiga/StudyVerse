import { AuthGuard } from "../../components/layout/AuthGuard";
import { WorkspaceContent } from "../../components/workspace/WorkspaceContent";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;

  return (
    <AuthGuard>
      <WorkspaceContent roomId={roomId} />
    </AuthGuard>
  );
}
