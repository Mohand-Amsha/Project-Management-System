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
};