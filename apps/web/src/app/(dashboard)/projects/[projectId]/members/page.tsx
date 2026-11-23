import { ComingSoon } from "@/components/shared/ComingSoon";

export default async function ProjectMembersPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <ComingSoon
      title="Project members"
      backHref={`/projects/${projectId}`}
      backLabel="Back to board"
    />
  );
}
