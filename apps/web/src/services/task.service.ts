import { api, ApiResponse } from "@/lib/api";
import { Task } from "@/types/task";

export const taskService = {
  create: async (projectId: string, payload: { title: string; description?: string; priority?: string }): Promise<Task> => {
    // Note: Backend route is /api/projects/:projectId/tasks
    const { data } = await api.post<ApiResponse<Task>>(`/api/projects/${projectId}/tasks`, payload);
    return data.data;
  },
  list: async (projectId: string): Promise<Task[]> => {
    const { data } = await api.get<ApiResponse<Task[]>>(`/api/projects/${projectId}/tasks`);
    return data.data;
  },
   updateStatus: async (taskId: string, status: string): Promise<Task> => {
    // Assuming your backend route is PATCH /api/tasks/:taskId
    const { data } = await api.patch<ApiResponse<Task>>(`/api/tasks/${taskId}`, { status });
    return data.data;
  },
};