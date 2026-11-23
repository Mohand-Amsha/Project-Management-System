import { api, ApiResponse } from "@/lib/api";
import type { CreateTaskPayload, Task, UpdateTaskPayload } from "@/types/task";

export const taskService = {
  // Backend route: POST /api/projects/:projectId/tasks
  create: async (projectId: string, payload: CreateTaskPayload): Promise<Task> => {
    const { data } = await api.post<ApiResponse<Task>>(`/api/projects/${projectId}/tasks`, payload);
    return data.data;
  },

  list: async (projectId: string): Promise<Task[]> => {
    const { data } = await api.get<ApiResponse<Task[]>>(`/api/projects/${projectId}/tasks`);
    return data.data;
  },

  get: async (taskId: string): Promise<Task> => {
    const { data } = await api.get<ApiResponse<Task>>(`/api/tasks/${taskId}`);
    return data.data;
  },

  // Backend route: PATCH /api/tasks/:id (any subset of fields, including status and position)
  update: async (taskId: string, payload: UpdateTaskPayload): Promise<Task> => {
    const { data } = await api.patch<ApiResponse<Task>>(`/api/tasks/${taskId}`, payload);
    return data.data;
  },

  remove: async (taskId: string): Promise<void> => {
    await api.delete(`/api/tasks/${taskId}`);
  },
};
