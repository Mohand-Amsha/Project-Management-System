import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
};

// Translate common database errors into client errors instead of a blanket 500
const toAppError = (err: Error & { code?: number; name: string }): AppError | null => {
  if (err instanceof AppError) return err;
  if (err.code === 11000) return new AppError("A record with that value already exists", 409);
  if (err.name === "ValidationError") return new AppError(err.message, 400);
  if (err.name === "CastError") return new AppError("Invalid ID or value", 400);
  return null;
};

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const known = toAppError(err);
  const statusCode = known?.statusCode ?? 500;
  const message = known?.message ?? "Internal Server Error";

  // Log full error in development
  if (process.env.NODE_ENV === "development") {
    console.error("❌ Error:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
