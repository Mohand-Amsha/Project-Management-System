import { ComingSoon } from "@/components/shared/ComingSoon";

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <ComingSoon
      title="Project settings"
      backHref={`/projects/${projectId}`}
      backLabel="Back to board"
    />
  );
}
