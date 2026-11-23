export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface TaskUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Task {
  _id: string;
  /** Human-readable ID such as "WEB-42" */
  key: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  /** Project id (not populated by the API) */
  project: string;
  reporter?: TaskUser;
  assignee?: TaskUser | null;
  labels?: string[];
  /** Ordering inside a status column; may be fractional or negative */
  position: number;
  dueDate?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  /** Member id, or null to unassign */
  assignee?: string | null;
  /** ISO datetime, or null to clear */
  dueDate?: string | null;
  labels?: string[];
  position?: number;
}
