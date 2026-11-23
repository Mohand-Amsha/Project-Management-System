"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types/task";
import { TaskCard } from "./TaskCard";

function SortableTaskCard({ task, onOpen }: { task: Task; onOpen: (task: Task) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && "opacity-40")}
      // A click only fires when the pointer moved less than the drag threshold
      onClick={() => onOpen(task)}
      {...attributes}
      {...listeners}
    >
      <TaskCard task={task} />
    </div>
  );
}

interface KanbanColumnProps {
  status: TaskStatus;
  label: string;
  tasks: Task[];
  onOpenTask: (task: Task) => void;
}

export function KanbanColumn({ status, label, tasks, onOpenTask }: KanbanColumnProps) {
  // The column itself is a drop target so cards can be dropped into an empty column
  const { isOver, setNodeRef } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "bg-muted/40 rounded-xl p-3 flex flex-col gap-3 min-h-[500px] transition-colors",
        isOver && "bg-muted/80 ring-2 ring-primary/50"
      )}
    >
      <div className="flex items-center justify-between px-1 mb-2">
        <h3 className="font-semibold text-sm">{label}</h3>
        <span className="text-xs font-medium bg-muted-foreground/20 text-muted-foreground px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 flex-1">
          {tasks.map((task) => (
            <SortableTaskCard key={task._id} task={task} onOpen={onOpenTask} />
          ))}
          {tasks.length === 0 && (
            <div className="border-2 border-dashed rounded-lg p-4 text-center text-xs text-muted-foreground">
              No tasks
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
