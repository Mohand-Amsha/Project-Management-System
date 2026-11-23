"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useDeleteTask, useUpdateTask } from "@/hooks/useTask";
import { TASK_COLUMNS, TASK_PRIORITIES } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { Task, TaskPriority, TaskStatus } from "@/types/task";

export interface AssigneeOption {
  _id: string;
  name: string;
}

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30";

// <input type="date"> works with "YYYY-MM-DD"; the API expects a full ISO datetime
const toDateInput = (iso?: string | null) => (iso ? iso.slice(0, 10) : "");
const fromDateInput = (value: string) =>
  value ? new Date(`${value}T00:00:00.000Z`).toISOString() : null;

/**
 * Edit form for one task. The form state is initialised from `task`, so the
 * parent should remount it (via `key`) whenever fresh task data arrives.
 */
export function TaskDetailPanel({
  task,
  members,
}: {
  task: Task;
  members: AssigneeOption[];
}) {
  const router = useRouter();
  const update = useUpdateTask(task._id);
  const remove = useDeleteTask(task.project);

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [assignee, setAssignee] = useState(task.assignee?._id ?? "");
  const [dueDate, setDueDate] = useState(toDateInput(task.dueDate));
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Keep the current assignee selectable even if they are no longer a project member
  const assigneeOptions =
    task.assignee && !members.some((m) => m._id === task.assignee?._id)
      ? [...members, { _id: task.assignee._id, name: task.assignee.name }]
      : members;

  const isDirty =
    title !== task.title ||
    description !== (task.description ?? "") ||
    status !== task.status ||
    priority !== task.priority ||
    assignee !== (task.assignee?._id ?? "") ||
    dueDate !== toDateInput(task.dueDate);
  const titleValid = title.trim().length >= 2;

  const handleSave = () => {
    update.mutate(
      {
        title: title.trim(),
        description,
        status,
        priority,
        assignee: assignee || null,
        dueDate: fromDateInput(dueDate),
      },
      { onSuccess: () => toast.success("Task updated") }
    );
  };

  const handleDelete = () => {
    remove.mutate(task._id, {
      onSuccess: () => {
        toast.success("Task deleted");
        router.push(`/projects/${task.project}`);
      },
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link
        href={`/projects/${task.project}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to board
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <div className="space-y-2">
            <span className="text-xs font-mono text-muted-foreground">{task.key}</span>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="Task title"
              className="h-11 text-lg font-semibold"
              maxLength={200}
            />
            {!titleValid && (
              <p className="text-xs text-destructive">Title must be at least 2 characters.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={10}
              maxLength={5000}
            />
          </div>
        </div>

        <Card className="h-fit">
          <CardContent className="space-y-4 p-4">
            <div className="space-y-1.5">
              <Label htmlFor="task-status">Status</Label>
              <select
                id="task-status"
                className={selectClass}
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                {TASK_COLUMNS.map((c) => (
                  <option key={c.status} value={c.status}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-priority">Priority</Label>
              <select
                id="task-priority"
                className={selectClass}
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-assignee">Assignee</Label>
              <select
                id="task-assignee"
                className={selectClass}
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              >
                <option value="">Unassigned</option>
                {assigneeOptions.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-due">Due date</Label>
              <Input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="border-t pt-3 text-xs text-muted-foreground space-y-1">
              {task.reporter && <p>Reporter: {task.reporter.name}</p>}
              <p>Created: {formatDate(task.createdAt)}</p>
              <p>Updated: {formatDate(task.updatedAt)}</p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
              <Button onClick={handleSave} disabled={!isDirty || !titleValid || update.isPending}>
                {update.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this task?"
        description={`"${task.title}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        isPending={remove.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
