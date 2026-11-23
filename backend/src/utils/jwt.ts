import jwt, { SignOptions } from "jsonwebtoken";
import { AppError } from "./AppError.js";

export interface JwtPayload {
  userId: string;
  organizationId: string;
  role: "admin" | "pm" | "member";
}

const getSecret = (key: "access" | "refresh"): string => {
  const secret =
    key === "access" ? process.env.JWT_SECRET : process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new AppError(`Missing ${key} JWT secret`, 500);
  return secret;
};

export const signAccessToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || "15m") as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, getSecret("access"), options);
};

export const signRefreshToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, getSecret("refresh"), options);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, getSecret("access")) as JwtPayload;
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, getSecret("refresh")) as JwtPayload;
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }
};