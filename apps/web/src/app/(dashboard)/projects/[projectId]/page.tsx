"use client";

import { useParams } from "next/navigation";

import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { useProject } from "@/hooks/useProject";
import { useTasks } from "@/hooks/useTasks";

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: tasks, isLoading: tasksLoading, isError: tasksError } = useTasks(projectId);

  if (projectLoading) return <LoadingSpinner />;
  if (!project) return <div className="text-red-500">Failed to load project.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: project.color }} />
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <span className="text-sm font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
              {project.key}
            </span>
          </div>
          <p className="text-muted-foreground mt-1">{project.description}</p>
        </div>
        <CreateTaskDialog projectId={project._id} />
      </div>

      {tasksLoading ? (
        <LoadingSpinner />
      ) : tasksError ? (
        <div className="text-red-500">Failed to load tasks.</div>
      ) : (
        <KanbanBoard projectId={project._id} tasks={tasks ?? []} />
      )}
    </div>
  );
}
