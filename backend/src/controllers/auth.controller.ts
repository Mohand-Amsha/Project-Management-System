import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service.js";
import { AppError } from "../utils/AppError.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.loginUser(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const inviteInfo = async (
  req: Request<{ token: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const info = await authService.getInviteInfo(req.params.token);
    res.status(200).json({ success: true, data: info });
  } catch (err) {
    next(err);
  }
};

export const acceptInvite = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.acceptInvite(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const me = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new AppError("Not authenticated", 401);
    const user = await authService.getCurrentUser(req.user.userId);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};