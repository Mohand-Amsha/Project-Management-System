import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import { taskService } from "@/services/task.service";
import type { TaskStatus } from "@/types/task";

export const tasksKey = (projectId: string) => ["tasks", projectId] as const;

export function useTasks(projectId: string) {
  return useQuery({
    queryKey: tasksKey(projectId),
    queryFn: () => taskService.list(projectId),
    enabled: !!projectId,
  });
}

/**
 * Persists a drag-and-drop move (new column and/or new position).
 * The board updates the cache optimistically before calling this; if the
 * request fails we show an error and refetch so the board matches the server.
 */
export function useMoveTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      status,
      position,
    }: {
      taskId: string;
      status: TaskStatus;
      position: number;
    }) => taskService.update(taskId, { status, position }),
    onError: (err) => toast.error(getApiErrorMessage(err)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: tasksKey(projectId) }),
  });
}
