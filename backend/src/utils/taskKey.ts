import { Task } from "../models/Task.js";

/**
 * Generates the next task key for a project (e.g. WEB-1, WEB-2).
 * NOTE: This is not 100% race-proof under high concurrency.
 * For production at scale, use a dedicated counter collection with findOneAndUpdate($inc).
 * For now this is fine and simple.
 */
export const generateTaskKey = async (
  projectId: string,
  projectKey: string
): Promise<string> => {
  const count = await Task.countDocuments({ project: projectId });
  return `${projectKey}-${count + 1}`;
};