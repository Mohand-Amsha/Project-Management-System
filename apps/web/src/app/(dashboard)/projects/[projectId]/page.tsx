"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Loader2, LayoutDashboard, ListTodo } from "lucide-react";
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor, useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";

import { projectService } from "@/services/project.service";
import { taskService } from "@/services/task.service";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskStatus, Task } from "@/types/task";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";

// --- Draggable Task Wrapper ---
function DraggableTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task._id,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <TaskCard task={task} />
    </div>
  );
}

// --- Droppable Column Wrapper ---
function DroppableColumn({ id, children, label, count }: { id: string, children: React.ReactNode, label: string, count: number }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div 
      ref={setNodeRef} 
      className={`bg-muted/40 rounded-xl p-3 flex flex-col gap-3 min-h-[500px] transition-colors ${
        isOver ? "bg-muted/80 ring-2 ring-primary/50" : ""
      }`}
    >
      <div className="flex items-center justify-between px-1 mb-2">
        <h3 className="font-semibold text-sm">{label}</h3>
        <span className="text-xs font-medium bg-muted-foreground/20 text-muted-foreground px-2 py-0.5 rounded-full">
          {count}
        </span>
      </div>
      {children}
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectService.getById(projectId),
    enabled: !!projectId,
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => taskService.list(projectId),
    enabled: !!projectId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      taskService.updateStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;
    const task = tasks?.find((t) => t._id === taskId);

    if (task && task.status !== newStatus) {
      updateStatusMutation.mutate({ taskId, status: newStatus });
    }
  };

  const columns: { label: string; status: TaskStatus }[] = [
    { label: "To Do", status: "todo" },
    { label: "In Progress", status: "in_progress" },
    { label: "Review", status: "review" },
    { label: "Done", status: "done" },
  ];

  if (projectLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  if (!project) return <div className="text-red-500">Failed to load project.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: project.color }} />
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <span className="text-sm font-mono text-muted-foreground bg-muted px-2 py-1 rounded">{project.key}</span>
          </div>
          <p className="text-muted-foreground mt-1">{project.description}</p>
        </div>
        <CreateTaskDialog projectId={project._id} />
      </div>

      <div className="border-b flex gap-6">
        <button className="pb-3 border-b-2 border-primary text-primary font-medium flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4" /> Board
        </button>
        <button className="pb-3 border-b-2 border-transparent text-muted-foreground hover:text-foreground flex items-center gap-2">
          <ListTodo className="h-4 w-4" /> List
        </button>
      </div>

      {tasksLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            {columns.map((col) => {
              const columnTasks = tasks?.filter((t) => t.status === col.status) || [];
              
              return (
                <DroppableColumn key={col.status} id={col.status} label={col.label} count={columnTasks.length}>
                  <div className="space-y-3">
                    {columnTasks.map((task) => (
                      <DraggableTask key={task._id} task={task} />
                    ))}
                    {columnTasks.length === 0 && (
                      <div className="border-2 border-dashed rounded-lg p-4 text-center text-xs text-muted-foreground">No tasks</div>
                    )}
                  </div>
                </DroppableColumn>
              );
            })}
          </div>
        </DndContext>
      )}
    </div>
  );
}