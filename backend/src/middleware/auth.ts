import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";

export const protect = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new AppError("Not authenticated", 401);
    }

    const token = header.split(" ")[1];
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    next(err);
  }
};

export const authorize =
  (...roles: Array<"admin" | "pm" | "member">) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(new AppError("Not authenticated", 401));
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Forbidden: insufficient permissions", 403));
    }
    next();
  };