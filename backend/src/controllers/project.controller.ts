import { Request, Response, NextFunction } from "express";
import * as projectService from "../services/project.service.js";
import { AppError } from "../utils/AppError.js";

// ---------- Typed request shapes ----------
type IdParams = { id: string };
type MemberParams = { id: string; userId: string };

type CreateProjectBody = {
  name: string;
  description?: string;
  key: string;
  status?: "planning" | "active" | "on_hold" | "completed" | "archived";
  startDate?: string;
  dueDate?: string;
  color?: string;
};

type UpdateProjectBody = Partial<CreateProjectBody>;

type AddMembersBody = { userIds: string[] };

// ---------- Handlers ----------

export const create = async (
  req: Request<{}, {}, CreateProjectBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new AppError("Not authenticated", 401);
    const project = await projectService.createProject(req.body, req.user);
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

export const list = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new AppError("Not authenticated", 401);
    const projects = await projectService.listProjects(req.user);
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (err) {
    next(err);
  }
};

export const getOne = async (
  req: Request<IdParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new AppError("Not authenticated", 401);
    const project = await projectService.getProjectById(
      req.params.id,
      req.user
    );
    res.status(200).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

export const update = async (
  req: Request<IdParams, {}, UpdateProjectBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new AppError("Not authenticated", 401);
    const project = await projectService.updateProject(
      req.params.id,
      req.body,
      req.user
    );
    res.status(200).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

export const remove = async (
  req: Request<IdParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new AppError("Not authenticated", 401);
    await projectService.deleteProject(req.params.id, req.user);
    res.status(200).json({ success: true, message: "Project deleted" });
  } catch (err) {
    next(err);
  }
};

export const addMembers = async (
  req: Request<IdParams, {}, AddMembersBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new AppError("Not authenticated", 401);
    const project = await projectService.addMembers(
      req.params.id,
      req.body.userIds,
      req.user
    );
    res.status(200).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

export const removeMember = async (
  req: Request<MemberParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new AppError("Not authenticated", 401);
    const project = await projectService.removeMember(
      req.params.id,
      req.params.userId,
      req.user
    );
    res.status(200).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};