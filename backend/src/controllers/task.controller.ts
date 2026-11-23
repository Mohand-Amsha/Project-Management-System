import { Request, Response, NextFunction } from "express";
import * as taskService from "../services/task.service.js";
import { AppError } from "../utils/AppError.js";
import type { ListTasksQuery } from "../validators/task.validator.js";


type ProjectParams = { projectId: string };
type TaskParams = { id: string };
type CreateBody = {
  title: string;
  description?: string;
  assignee?: string | null;
  status?: "todo" | "in_progress" | "review" | "done";
  priority?: "low" | "medium" | "high" | "urgent";
  labels?: string[];
  dueDate?: string | null;
};
type UpdateBody = Partial<CreateBody> & { position?: number };
type ListQuery = ListTasksQuery;

export const create = async (
  req: Request<ProjectParams, {}, CreateBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new AppError("Not authenticated", 401);
    const task = await taskService.createTask(
      req.params.projectId,
      req.body,
      req.user
    );
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};
export const list = async (
  req: Request<{ projectId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new AppError("Not authenticated", 401);

    const query = req.query as unknown as ListQuery;

    const tasks = await taskService.listTasks(
      req.params.projectId,
      query,
      req.user
    );
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    next(err);
  }
};

export const getOne = async (
  req: Request<TaskParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new AppError("Not authenticated", 401);
    const task = await taskService.getTaskById(req.params.id, req.user);
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

export const update = async (
  req: Request<TaskParams, {}, UpdateBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new AppError("Not authenticated", 401);
    const task = await taskService.updateTask(
      req.params.id,
      req.body,
      req.user
    );
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

export const remove = async (
  req: Request<TaskParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new AppError("Not authenticated", 401);
    await taskService.deleteTask(req.params.id, req.user);
    res.status(200).json({ success: true, message: "Task deleted" });
  } catch (err) {
    next(err);
  }
};