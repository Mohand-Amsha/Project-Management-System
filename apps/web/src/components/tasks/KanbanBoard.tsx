"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { TASK_COLUMNS } from "@/lib/constants";
import { tasksKey, useMoveTask } from "@/hooks/useTasks";
import type { Task, TaskStatus } from "@/types/task";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";

type Columns = Record<TaskStatus, Task[]>;

const COLUMN_IDS: TaskStatus[] = TASK_COLUMNS.map((c) => c.status);

const isColumnId = (id: UniqueIdentifier): id is TaskStatus =>
  (COLUMN_IDS as string[]).includes(String(id));

function groupTasks(tasks: Task[]): Columns {
  const columns: Columns = { todo: [], in_progress: [], review: [], done: [] };
  for (const task of tasks) columns[task.status]?.push(task);
  for (const status of COLUMN_IDS) {
    columns[status].sort(
      (a, b) => a.position - b.position || a.createdAt.localeCompare(b.createdAt)
    );
  }
  return columns;
}

/**
 * Position for a card dropped between two neighbours. Using the midpoint means
 * only the moved task is saved; the rest of the column is never renumbered.
 */
function positionBetween(prev?: number, next?: number): number {
  if (prev !== undefined && next !== undefined) return (prev + next) / 2;
  if (prev !== undefined) return prev + 1;
  if (next !== undefined) return next - 1;
  return 0;
}

function findColumn(columns: Columns, id: UniqueIdentifier): TaskStatus | undefined {
  if (isColumnId(id)) return id;
  return COLUMN_IDS.find((status) => columns[status].some((t) => t._id === id));
}

export function KanbanBoard({ projectId, tasks }: { projectId: string; tasks: Task[] }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const moveTask = useMoveTask(projectId);

  const serverColumns = useMemo(() => groupTasks(tasks), [tasks]);

  // While dragging we work on a local copy so cards move live between columns.
  // When the drop is saved we update the query cache and discard the copy.
  const [draft, setDraft] = useState<Columns | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const columns = draft ?? serverColumns;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const activeTask = activeId ? (tasks.find((t) => t._id === activeId) ?? null) : null;

  const openTask = (task: Task) => {
    router.push(`/projects/${projectId}/tasks/${task._id}`);
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
    setDraft(serverColumns);
  };

  // Moving across columns: relocate the card in the draft so the target column makes room
  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over || !draft) return;

    const from = findColumn(draft, active.id);
    const to = findColumn(draft, over.id);
    if (!from || !to || from === to) return;

    const fromItems = draft[from];
    const toItems = draft[to];
    const moving = fromItems.find((t) => t._id === active.id);
    if (!moving) return;

    let insertAt: number;
    if (isColumnId(over.id)) {
      insertAt = toItems.length;
    } else {
      const overIndex = toItems.findIndex((t) => t._id === over.id);
      const dragged = active.rect.current.translated;
      const isBelow = !!dragged && dragged.top > over.rect.top + over.rect.height / 2;
      insertAt = overIndex + (isBelow ? 1 : 0);
    }

    setDraft({
      ...draft,
      [from]: fromItems.filter((t) => t._id !== active.id),
      [to]: [...toItems.slice(0, insertAt), { ...moving, status: to }, ...toItems.slice(insertAt)],
    });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const working = draft;
    setActiveId(null);

    if (!over || !working) {
      setDraft(null);
      return;
    }

    const target = findColumn(working, over.id);
    if (!target) {
      setDraft(null);
      return;
    }

    // Final order inside the target column
    const column = working[target];
    const activeIndex = column.findIndex((t) => t._id === active.id);
    const overIndex = isColumnId(over.id)
      ? column.length - 1
      : column.findIndex((t) => t._id === over.id);
    const ordered =
      activeIndex >= 0 && overIndex >= 0 && activeIndex !== overIndex
        ? arrayMove(column, activeIndex, overIndex)
        : column;

    const index = ordered.findIndex((t) => t._id === active.id);
    if (index < 0) {
      setDraft(null);
      return;
    }

    // Dropped back where it started: nothing to save
    const original = tasks.find((t) => t._id === active.id);
    const originalIndex = original
      ? serverColumns[original.status].findIndex((t) => t._id === active.id)
      : -1;
    if (original && original.status === target && originalIndex === index) {
      setDraft(null);
      return;
    }

    const taskId = String(active.id);
    const position = positionBetween(ordered[index - 1]?.position, ordered[index + 1]?.position);

    // Show the result immediately, then save it
    queryClient.setQueryData<Task[]>(tasksKey(projectId), (old) =>
      old?.map((t) => (t._id === taskId ? { ...t, status: target, position } : t))
    );
    setDraft(null);
    moveTask.mutate({ taskId, status: target, position });
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setDraft(null);
  };

  return (
    <DndContext
      // A fixed id keeps dnd-kit's generated aria ids identical on server and client
      id={`kanban-${projectId}`}
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        {TASK_COLUMNS.map(({ status, label }) => (
          <KanbanColumn
            key={status}
            status={status}
            label={label}
            tasks={columns[status]}
            onOpenTask={openTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} className="shadow-lg cursor-grabbing" /> : null}
      </DragOverlay>
    </DndContext>
  );
}
