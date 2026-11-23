import { Types } from "mongoose";
import { Project, IProject } from "../models/Project.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import {
  CreateProjectInput,
  UpdateProjectInput,
} from "../validators/project.validator.js";
import { JwtPayload } from "../utils/jwt.js";

const POPULATE = [
  { path: "owner", select: "name email avatar" },
  { path: "members", select: "name email avatar role" },
];

export const createProject = async (
  input: CreateProjectInput,
  auth: JwtPayload
): Promise<IProject> => {
  // Prevent key collision within same org
  const existing = await Project.findOne({
    organization: auth.organizationId,
    key: input.key,
  });
  if (existing) {
    throw new AppError(`Project key "${input.key}" already exists in your organization`, 409);
  }

  const project = await Project.create({
    ...input,
    organization: auth.organizationId,
    owner: auth.userId,
    members: [auth.userId], // owner is auto-added as a member
    startDate: input.startDate ? new Date(input.startDate) : undefined,
    dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
  });

  return project.populate(POPULATE);
};

export const listProjects = async (auth: JwtPayload): Promise<IProject[]> => {
  return Project.find({
    organization: auth.organizationId,
    members: auth.userId, // tenant + membership scope
  })
    .populate(POPULATE)
    .sort({ updatedAt: -1 });
};

export const getProjectById = async (
  projectId: string,
  auth: JwtPayload
): Promise<IProject> => {
  const project = await Project.findOne({
    _id: projectId,
    organization: auth.organizationId,
    members: auth.userId,
  }).populate(POPULATE);

  if (!project) throw new AppError("Project not found", 404);
  return project;
};

export const updateProject = async (
  projectId: string,
  input: UpdateProjectInput,
  auth: JwtPayload
): Promise<IProject> => {
  const project = await Project.findOne({
    _id: projectId,
    organization: auth.organizationId,
  });
  if (!project) throw new AppError("Project not found", 404);

  // Only owner or admin can update
  const isOwner = project.owner.toString() === auth.userId;
  if (!isOwner && auth.role !== "admin") {
    throw new AppError("Only the project owner or admin can update it", 403);
  }

  if (input.name !== undefined) project.name = input.name;
  if (input.description !== undefined) project.description = input.description;
  if (input.status !== undefined) project.status = input.status;
  if (input.color !== undefined) project.color = input.color;
  if (input.startDate !== undefined) project.startDate = new Date(input.startDate);
  if (input.dueDate !== undefined) project.dueDate = new Date(input.dueDate);
  // Note: we intentionally do NOT allow updating `key` after creation.

  await project.save();
  return project.populate(POPULATE);
};

export const deleteProject = async (
  projectId: string,
  auth: JwtPayload
): Promise<void> => {
  const project = await Project.findOne({
    _id: projectId,
    organization: auth.organizationId,
  });
  if (!project) throw new AppError("Project not found", 404);

  const isOwner = project.owner.toString() === auth.userId;
  if (!isOwner && auth.role !== "admin") {
    throw new AppError("Only the project owner or admin can delete it", 403);
  }

  await project.deleteOne();
};

export const addMembers = async (
  projectId: string,
  userIds: string[],
  auth: JwtPayload
): Promise<IProject> => {
  const project = await Project.findOne({
    _id: projectId,
    organization: auth.organizationId,
  });
  if (!project) throw new AppError("Project not found", 404);

  const isOwner = project.owner.toString() === auth.userId;
  if (!isOwner && auth.role !== "admin" && auth.role !== "pm") {
    throw new AppError("Only owner, admin, or PM can add members", 403);
  }

  // Validate that all userIds exist and belong to the same organization
  const users = await User.find({
    _id: { $in: userIds.map((id) => new Types.ObjectId(id)) },
    organization: auth.organizationId,
    isActive: true,
  }).select("_id");

  if (users.length !== userIds.length) {
    throw new AppError(
      "One or more users not found or not in your organization",
      400
    );
  }

  // Only add users not already in the project
  const existingIds = new Set(project.members.map((m) => m.toString()));
  const newIds = userIds.filter((id) => !existingIds.has(id));

  project.members.push(...newIds.map((id) => new Types.ObjectId(id)));
  await project.save();

  return project.populate(POPULATE);
};

export const removeMember = async (
  projectId: string,
  userId: string,
  auth: JwtPayload
): Promise<IProject> => {
  const project = await Project.findOne({
    _id: projectId,
    organization: auth.organizationId,
  });
  if (!project) throw new AppError("Project not found", 404);

  const isOwner = project.owner.toString() === auth.userId;
  if (!isOwner && auth.role !== "admin" && auth.role !== "pm") {
    throw new AppError("Only owner, admin, or PM can remove members", 403);
  }

  // Owner cannot be removed from their own project
  if (project.owner.toString() === userId) {
    throw new AppError("Cannot remove the project owner", 400);
  }

  project.members = project.members.filter((m) => m.toString() !== userId);
  await project.save();

  return project.populate(POPULATE);
};