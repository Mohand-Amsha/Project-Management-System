export type ProjectStatus = "planning" | "active" | "on_hold" | "completed" | "archived";

export interface Project {
  _id: string;
  name: string;
  key: string;
  description?: string;
  status: ProjectStatus;
  color: string;
  owner: { _id: string; name: string; email: string };
  members: { _id: string; name: string; email: string; role: string }[];
  createdAt: string;
  updatedAt: string;
}