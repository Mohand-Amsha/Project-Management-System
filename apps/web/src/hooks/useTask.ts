import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import { taskService } from "@/services/task.service";
import { tasksKey } from "@/hooks/useTasks";
import type { Task, UpdateTaskPayload } from "@/types/task";

export const taskKey = (taskId: string) => ["task", taskId] as const;

export function useTask(taskId: string) {
  return useQuery({
    queryKey: taskKey(taskId),
    queryFn: () => taskService.get(taskId),
    enabled: !!taskId,
  });
}

export function useUpdateTask(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateTaskPayload) => taskService.update(taskId, payload),
    onSuccess: (task: Task) => {
      queryClient.setQueryData(taskKey(taskId), task);
      queryClient.invalidateQueries({ queryKey: tasksKey(task.project) });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}

export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => taskService.remove(taskId),
    onSuccess: (_data, taskId) => {
      queryClient.removeQueries({ queryKey: taskKey(taskId) });
      queryClient.invalidateQueries({ queryKey: tasksKey(projectId) });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}
