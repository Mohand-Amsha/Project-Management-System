import { redirect } from "next/navigation";

// The board lives on the project page itself; keep /board working as an alias.
export default async function BoardPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  redirect(`/projects/${projectId}`);
}
