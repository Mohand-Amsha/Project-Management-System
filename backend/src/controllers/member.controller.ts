import { Request, Response } from "express";
import * as memberService from "../services/member.service.js";
import { AppError } from "../utils/AppError.js";
import type { JwtPayload } from "../utils/jwt.js";
import type { CreateInviteInput, UpdateMemberInput } from "../validators/member.validator.js";

// Express 5 forwards rejected promises to the error handler, so no try/catch is needed here

const requireUser = (req: Request): JwtPayload => {
  if (!req.user) throw new AppError("Not authenticated", 401);
  return req.user;
};

export const list = async (req: Request, res: Response): Promise<void> => {
  const members = await memberService.listMembers(requireUser(req));
  res.status(200).json({ success: true, count: members.length, data: members });
};

export const listInvites = async (req: Request, res: Response): Promise<void> => {
  const invites = await memberService.listInvites(requireUser(req));
  res.status(200).json({ success: true, count: invites.length, data: invites });
};

export const createInvite = async (
  req: Request<{}, {}, CreateInviteInput>,
  res: Response
): Promise<void> => {
  const result = await memberService.createInvite(req.body, requireUser(req));
  res.status(201).json({ success: true, data: result });
};

export const revokeInvite = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  await memberService.revokeInvite(req.params.id, requireUser(req));
  res.status(200).json({ success: true, message: "Invitation revoked" });
};

export const update = async (
  req: Request<{ userId: string }, {}, UpdateMemberInput>,
  res: Response
): Promise<void> => {
  const member = await memberService.updateMember(req.params.userId, req.body, requireUser(req));
  res.status(200).json({ success: true, data: member });
};
