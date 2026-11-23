"use client";

import { Clock, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PRIORITY_STYLES } from "@/lib/constants";
import { formatDate, getInitials, isOverdue } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";

export function TaskCard({ task, className }: { task: Task; className?: string }) {
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <Card className={cn("cursor-grab hover:border-primary/50 transition-colors shadow-sm", className)}>
      <CardContent className="p-3 space-y-3">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-muted-foreground">{task.key}</span>
          <p className="text-sm font-medium leading-tight">{task.title}</p>
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
        )}

        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.labels.map((label) => (
              <span
                key={label}
                className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Badge
            variant="secondary"
            className={cn("text-[10px] px-1.5 py-0", PRIORITY_STYLES[task.priority])}
          >
            {task.priority.toUpperCase()}
          </Badge>

          <div className="flex items-center gap-2 text-muted-foreground">
            {task.dueDate && (
              <div className={cn("flex items-center gap-1 text-[10px]", overdue && "text-red-600")}>
                <Clock className="h-3 w-3" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}
            {task.assignee ? (
              <div
                title={task.assignee.name}
                className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-semibold text-primary"
              >
                {getInitials(task.assignee.name)}
              </div>
            ) : (
              <div
                title="Unassigned"
                className="h-5 w-5 rounded-full border border-dashed flex items-center justify-center"
              >
                <User className="h-3 w-3" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
