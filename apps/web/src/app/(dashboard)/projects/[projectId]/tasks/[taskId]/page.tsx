"use client";

import { useParams } from "next/navigation";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { TaskDetailPanel } from "@/components/tasks/TaskDetailPanel";
import { useProject } from "@/hooks/useProject";
import { useTask } from "@/hooks/useTask";

export default function TaskPage() {
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();
  const { data: task, isLoading, isError } = useTask(taskId);
  const { data: project } = useProject(projectId);

  if (isLoading) return <LoadingSpinner />;
  if (isError || !task) return <p className="text-destructive">Task not found.</p>;

  return (
    // Remount after each save so the form picks up the fresh server values
    <TaskDetailPanel
      key={`${task._id}-${task.updatedAt}`}
      task={task}
      members={project?.members ?? []}
    />
  );
}
