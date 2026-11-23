"use client";

import { Task } from "@/types/task";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";

export function TaskCard({ task }: { task: Task }) {
  // Helper to color-code priorities
  const priorityColors = {
    low: "bg-blue-100 text-blue-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-orange-100 text-orange-700",
    urgent: "bg-red-100 text-red-700",
  };

  return (
    <Card className="cursor-grab hover:border-primary/50 transition-colors shadow-sm">
      <CardContent className="p-3 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-tight">{task.title}</p>
        </div>
        
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${priorityColors[task.priority]}`}>
            {task.priority.toUpperCase()}
          </Badge>

          <div className="flex items-center gap-2 text-muted-foreground">
            {task.dueDate && (
              <div className="flex items-center gap-1 text-[10px]">
                <Clock className="h-3 w-3" />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
            {/* Mock Avatar for now */}
            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center border border-background">
              <User className="h-3 w-3 text-primary" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}