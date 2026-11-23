import { Types } from "mongoose";
import { Task, ITask } from "../models/Task.js";
import { Project } from "../models/Project.js";
import { AppError } from "../utils/AppError.js";
import { JwtPayload } from "../utils/jwt.js";
import { generateTaskKey } from "../utils/taskKey.js";
import {
  CreateTaskInput,
  UpdateTaskInput,
  ListTasksQuery,
} from "../validators/task.validator.js";

const POPULATE = [
  { path: "assignee", select: "name email avatar" },
  { path: "reporter", select: "name email avatar" },
];

/**
 * Ensures the current user is a member of the given project (and same org).
 * Throws 404 if not found so we don't leak existence.
 */
const assertProjectAccess = async (projectId: string, auth: JwtPayload) => {
  const project = await Project.findOne({
    _id: projectId,
    organization: auth.organizationId,
  });
  if (!project) throw new AppError("Project not found", 404);

  const isMember = project.members.some(
    (m) => m.toString() === auth.userId
  );
  if (!isMember && auth.role !== "admin") {
    throw new AppError("You do not have access to this project", 403);
  }
  return project;
};
export const createTask = async (
  projectId: string,
  input: CreateTaskInput,
  auth: JwtPayload
): Promise<ITask> => {
  const project = await assertProjectAccess(projectId, auth);

  // If an assignee is given, they must also be a member of the project
  if (input.assignee) {
    const assigneeIsMember = project.members.some(
      (m) => m.toString() === input.assignee
    );
    if (!assigneeIsMember) {
      throw new AppError("Assignee is not a member of this project", 400);
    }
  }

  const key = await generateTaskKey(projectId, project.key);

  // Put new tasks at the top of their status column
  const topTask = await Task.findOne({
    project: projectId,
    status: input.status || "todo",
  })
    .sort({ position: 1 })
    .select("position");

  const position = topTask ? topTask.position - 1 : 0;

  const task = await Task.create({
    title: input.title,
    description: input.description,
    assignee: input.assignee
      ? new Types.ObjectId(input.assignee)
      : undefined,
    status: input.status,
    priority: input.priority,
    labels: input.labels,
    dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    key,
    project: new Types.ObjectId(projectId),
    organization: new Types.ObjectId(auth.organizationId),
    reporter: new Types.ObjectId(auth.userId),
    position,
  });

  return task.populate(POPULATE);
};

export const listTasks = async (
  projectId: string,
  query: ListTasksQuery,
  auth: JwtPayload
): Promise<ITask[]> => {
  await assertProjectAccess(projectId, auth);

  const filter: Record<string, unknown> = {
    project: projectId,
    organization: auth.organizationId,
  };
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.assignee) filter.assignee = new Types.ObjectId(query.assignee);
  if (query.search) {
    filter.title = { $regex: query.search, $options: "i" };
  }

  return Task.find(filter)
    .populate(POPULATE)
    .sort({ status: 1, position: 1 });
};

export const getTaskById = async (
  taskId: string,
  auth: JwtPayload
): Promise<ITask> => {
  const task = await Task.findOne({
    _id: taskId,
    organization: auth.organizationId,
  }).populate(POPULATE);

  if (!task) throw new AppError("Task not found", 404);
  await assertProjectAccess(task.project.toString(), auth);
  return task;
};

export const updateTask = async (
  taskId: string,
  input: UpdateTaskInput,
  auth: JwtPayload
): Promise<ITask> => {
  const task = await Task.findOne({
    _id: taskId,
    organization: auth.organizationId,
  });
  if (!task) throw new AppError("Task not found", 404);

  const project = await assertProjectAccess(task.project.toString(), auth);

  if (input.assignee) {
    const isMember = project.members.some(
      (m) => m.toString() === input.assignee
    );
    if (!isMember) throw new AppError("Assignee is not a project member", 400);
  }

  if (input.title !== undefined) task.title = input.title;
  if (input.description !== undefined) task.description = input.description;
  if (input.assignee !== undefined) {
    task.assignee = input.assignee ? new Types.ObjectId(input.assignee) : undefined;
  }
  if (input.priority !== undefined) task.priority = input.priority;
  if (input.labels !== undefined) task.labels = input.labels;
  if (input.dueDate !== undefined) {
    task.dueDate = input.dueDate ? new Date(input.dueDate) : undefined;
  }
  if (input.position !== undefined) task.position = input.position;

  // Handle status transitions + completedAt timestamp
  if (input.status !== undefined && input.status !== task.status) {
    task.status = input.status;
    if (input.status === "done") {
      task.completedAt = new Date();
    } else {
      task.completedAt = undefined;
    }
  }

  await task.save();
  return task.populate(POPULATE);
};

export const deleteTask = async (
  taskId: string,
  auth: JwtPayload
): Promise<void> => {
  const task = await Task.findOne({
    _id: taskId,
    organization: auth.organizationId,
  });
  if (!task) throw new AppError("Task not found", 404);

  await assertProjectAccess(task.project.toString(), auth);

  // Only reporter, project owner, or admin can delete
  const project = await Project.findById(task.project).select("owner");
  const isOwner = project?.owner.toString() === auth.userId;
  const isReporter = task.reporter.toString() === auth.userId;

  if (!isOwner && !isReporter && auth.role !== "admin") {
    throw new AppError("Only the reporter, project owner, or admin can delete this task", 403);
  }

  await task.deleteOne();
};