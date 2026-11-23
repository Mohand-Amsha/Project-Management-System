import { useQuery } from "@tanstack/react-query";
import { projectService } from "@/services/project.service";

export const projectKey = (projectId: string) => ["project", projectId] as const;

export function useProject(projectId: string) {
  return useQuery({
    queryKey: projectKey(projectId),
    queryFn: () => projectService.getById(projectId),
    enabled: !!projectId,
  });
}
