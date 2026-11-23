import { api, ApiResponse } from "@/lib/api";
import { Project } from "@/types/project";

export const projectService = {
  list: async (): Promise<Project[]> => {
    const { data } = await api.get<ApiResponse<Project[]>>("/api/projects");
    return data.data;
  },
  
  create: async (payload: { name: string; key: string; description?: string }): Promise<Project> => {
    const { data } = await api.post<ApiResponse<Project>>("/api/projects", payload);
    return data.data;
  },
  getById: async (id: string): Promise<Project> => {
    const { data } = await api.get<ApiResponse<Project>>(`/api/projects/${id}`);
    return data.data;
  },
  addMembers: async (id: string, userIds: string[]): Promise<Project> => {
    const { data } = await api.patch<ApiResponse<Project>>(`/api/projects/${id}/members`, {
      userIds,
    });
    return data.data;
  },
  removeMember: async (id: string, userId: string): Promise<Project> => {
    const { data } = await api.delete<ApiResponse<Project>>(
      `/api/projects/${id}/members/${userId}`
    );
    return data.data;
  },
};