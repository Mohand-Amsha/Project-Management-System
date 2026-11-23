import { Types } from "mongoose";
import { User, IUser } from "../models/User.js";
import { Organization } from "../models/Organization.js";
import { AppError } from "../utils/AppError.js";
import { slugify, uniqueSlug } from "../utils/slug.js";
import {
  signAccessToken,
  signRefreshToken,
  JwtPayload,
} from "../utils/jwt.js";
import { RegisterInput, LoginInput } from "../validators/auth.validator.js";

interface AuthResult {
  user: Partial<IUser>;
  accessToken: string;
  refreshToken: string;
}

const buildTokens = (user: IUser): { accessToken: string; refreshToken: string } => {
  const payload: JwtPayload = {
    userId: user._id.toString(),
    organizationId: user.organization.toString(),
    role: user.role,
  };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
};

const sanitizeUser = (user: IUser) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  organization: user.organization,
  avatar: user.avatar,
  isEmailVerified: user.isEmailVerified,
  createdAt: user.createdAt,
});

export const registerUser = async (input: RegisterInput): Promise<AuthResult> => {
  const existing = await User.findOne({ email: input.email });
  if (existing) throw new AppError("Email already in use", 409);

  // 1. Create organization (owner will be set after user is created)
  const baseSlug = slugify(input.organizationName) || "org";
  const org = await Organization.create({
    name: input.organizationName,
    slug: uniqueSlug(baseSlug),
    owner: new Types.ObjectId(), // placeholder, replaced with the real user id below
  });

  // 2. Create user as admin of that org
  const user = await User.create({
    name: input.name,
    email: input.email,
    password: input.password,
    role: "admin",
    organization: org._id,
  });

  // 3. Set the real owner
  org.owner = user._id;
  await org.save();

  const tokens = buildTokens(user);
  return { user: sanitizeUser(user), ...tokens };
};

export const loginUser = async (input: LoginInput): Promise<AuthResult> => {
  const user = await User.findOne({ email: input.email }).select("+password");
  if (!user) throw new AppError("Invalid email or password", 401);
  if (!user.isActive) throw new AppError("Account is disabled", 403);

  const ok = await user.comparePassword(input.password);
  if (!ok) throw new AppError("Invalid email or password", 401);

  user.lastLoginAt = new Date();
  await user.save();

  const tokens = buildTokens(user);
  return { user: sanitizeUser(user), ...tokens };
};

export const getCurrentUser = async (userId: string) => {
  const user = await User.findById(userId).populate("organization", "name slug plan");
  if (!user) throw new AppError("User not found", 404);
  return sanitizeUser(user);
};